async function handleRangeRequest(request, clientId) {
 const rangeHeader = request.headers.get('Range');
 console.log('SW: rangeHeader', rangeHeader);
 const url = new URL(request.url);
 const pathMatch = url.pathname.match(/^.*\/yellow\/media\/([^\/]+)\/([^\/]+)/);
 const accId = pathMatch[1];
 const uploadId = pathMatch[2];
 const client = await self.clients.get(clientId);

 console.log('SW: client', client);
 console.log('SW: accId', accId);
 console.log('SW: fileId', uploadId);

 if (!rangeHeader) {
  // Fallback: return the whole file (inefficient)
  const full = await fetch(request);
  return full;
 }

 const fileInfo = await postMessageWithResponse(client, {
  type: 'GET_FILE_INFO',
  payload: {
   accId,
   uploadId,
  },
 })
 console.log('SW: fileInfo', fileInfo);
 const { fileMimeType, fileSize } = fileInfo;

 //const size = buffer.byteLength;

 // Parse the Range header
 const matches = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
 if (!matches) {
  return new Response(null, { status: 416 }); // Range Not Satisfiable
 }

 const start = Number(matches[1]);
 let end = matches[2] ? Number(matches[2]) : start + (1024 * 1024);
 end = Math.min(end, fileSize);

 console.error('111111111111');
 console.error('111111111111');
 console.error('111111111111');
 console.error('111111111111');
 console.error('111111111111');

 return new Promise(resolve => {
  postMessageWithResponse(client, {
   type: 'GET_CHUNK',
   payload: {
    accId,
    uploadId,
    start,
    end,
    rangeHeader,
   },
  }).then(data => {
   const { chunk } = data;
   console.log('SW: GET_CHUNK', data);

   resolve(new Response(chunk.data, {
    status: 206,
    headers: {
     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
     'Accept-Ranges': 'bytes',
     'Content-Length': chunk.data.byteLength,
     'Content-Type': fileMimeType,
    },
   }))
  })

 })
}

function postMessageWithResponse (client, data) {
 return new Promise(resolve => {
  const channel = new MessageChannel();

  channel.port1.onmessage = event => {
   console.log('SW: received reply:', event.data);
   resolve(event.data);
  }

  client.postMessage(data, [channel.port2]);
 })
}

self.addEventListener('install', function(event) {
 // Skip the 'waiting' lifecycle phase, to go directly from 'installed' to 'activated', even if
 // there are still previous incarnations of this service worker registration active.
 console.log('SW: install event');
 event.waitUntil(self.skipWaiting());
 console.log('SW: skipWaiting done');
});

self.addEventListener('activate', function(event) {
 // Claim any clients immediately, so that the page will be under SW control without reloading.
 console.log('SW: activate event');
 event.waitUntil(self.clients.claim());
 console.log('SW: clients claimed');
});

self.addEventListener('fetch', function(event) {
 if (event.request.url.includes('/yellow/media')) {
  event.respondWith(handleRangeRequest(event.request, event.clientId));
 }
});
