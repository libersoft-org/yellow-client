const MEDIA_BRIDGE_TIMEOUT_MS = 65_000;

function createErrorResponse(status, message, headers = {}) {
	return new Response(message, {
		status,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/plain; charset=utf-8',
			...headers,
		},
	});
}

function getMediaRequestParts(url) {
	const pathMatch = url.pathname.match(/\/yellow\/media\/([^\/]+)\/([^\/]+)\/?$/);
	if (!pathMatch) return null;
	return { accId: pathMatch[1], uploadId: pathMatch[2] };
}

function parseRangeHeader(rangeHeader, fileSize) {
	if (!Number.isSafeInteger(fileSize) || fileSize <= 0) return null;
	const rangeMatch = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
	if (!rangeMatch || (!rangeMatch[1] && !rangeMatch[2])) return null;

	let start;
	let end;
	if (!rangeMatch[1]) {
		const suffixLength = Number(rangeMatch[2]);
		if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
		start = Math.max(fileSize - suffixLength, 0);
		end = fileSize - 1;
	} else {
		start = Number(rangeMatch[1]);
		end = rangeMatch[2] ? Number(rangeMatch[2]) : fileSize - 1;
		if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= fileSize || end < start) return null;
		end = Math.min(end, fileSize - 1);
	}
	return { start, end };
}

function getBinaryLength(data) {
	if (data instanceof ArrayBuffer) return data.byteLength;
	if (ArrayBuffer.isView(data)) return data.byteLength;
	if (typeof Blob !== 'undefined' && data instanceof Blob) return data.size;
	return undefined;
}

async function handleRangeRequest(request, clientId) {
	const url = new URL(request.url);
	const mediaRequest = getMediaRequestParts(url);
	if (!mediaRequest) return createErrorResponse(400, 'Invalid media request URL');

	if (!request.headers.get('Range')) {
		try {
			return await fetch(request);
		} catch (error) {
			console.error('Media fallback fetch failed:', error);
			return createErrorResponse(502, 'Media fallback fetch failed');
		}
	}

	if (!clientId) return createErrorResponse(503, 'Media client is unavailable');
	const client = await self.clients.get(clientId);
	if (!client) return createErrorResponse(503, 'Media client is unavailable');

	try {
		const fileInfo = await postMessageWithResponse(client, {
			type: 'GET_FILE_INFO',
			payload: mediaRequest,
		});
		const fileSize = Number(fileInfo?.fileSize);
		const fileMimeType = fileInfo?.fileMimeType;
		if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || typeof fileMimeType !== 'string') return createErrorResponse(502, 'Invalid media file metadata');

		const range = parseRangeHeader(request.headers.get('Range'), fileSize);
		if (!range) return createErrorResponse(416, 'Invalid media range', { 'Content-Range': `bytes */${fileSize}` });

		const chunkResponse = await postMessageWithResponse(client, {
			type: 'GET_CHUNK',
			payload: {
				...mediaRequest,
				start: range.start,
				end: range.end,
			},
		});
		const chunk = chunkResponse?.chunk;
		const chunkLength = getBinaryLength(chunk?.data);
		const expectedLength = range.end - range.start + 1;
		if (chunkLength !== expectedLength) return createErrorResponse(502, 'Invalid media chunk response');

		return new Response(chunk.data, {
			status: 206,
			headers: {
				'Accept-Ranges': 'bytes',
				'Content-Length': String(chunkLength),
				'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
				'Content-Type': fileMimeType,
			},
		});
	} catch (error) {
		console.error('Media bridge request failed:', error);
		const message = error instanceof Error && error.message.includes('timed out') ? 'Media client did not respond in time' : 'Media bridge request failed';
		return createErrorResponse(message.includes('time') ? 504 : 502, message);
	}
}

function postMessageWithResponse(client, data) {
	return new Promise((resolve, reject) => {
		if (!client) {
			reject(new Error('Media client is unavailable'));
			return;
		}

		const channel = new MessageChannel();
		let timeoutId;
		let settled = false;
		const complete = (callback, value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			channel.port1.onmessage = null;
			channel.port1.onmessageerror = null;
			channel.port1.close();
			callback(value);
		};

		channel.port1.onmessage = event => {
			const response = event.data;
			if (response?.error) {
				const message = typeof response.message === 'string' ? response.message : 'Media client request failed';
				complete(reject, new Error(message));
			} else complete(resolve, response);
		};
		channel.port1.onmessageerror = () => complete(reject, new Error('Media client response could not be decoded'));
		channel.port1.start();
		timeoutId = setTimeout(() => complete(reject, new Error('Media client request timed out')), MEDIA_BRIDGE_TIMEOUT_MS);

		try {
			client.postMessage(data, [channel.port2]);
		} catch (error) {
			complete(reject, error);
		}
	});
}

self.addEventListener('install', function (event) {
	// Skip the 'waiting' lifecycle phase, to go directly from 'installed' to 'activated', even if
	// there are still previous incarnations of this service worker registration active.
	console.log('SW: install event');
	event.waitUntil(self.skipWaiting());
	console.log('SW: skipWaiting done');
});

self.addEventListener('activate', function (event) {
	// Claim any clients immediately, so that the page will be under SW control without reloading.
	console.log('SW: activate event');
	event.waitUntil(self.clients.claim());
	console.log('SW: clients claimed');
});

self.addEventListener('fetch', function (event) {
	if (event.request.url.includes('/yellow/media')) {
		event.respondWith(handleRangeRequest(event.request, event.clientId));
	}
});
