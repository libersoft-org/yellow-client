import { type IFileDownload, type IFileUpload, type IFileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, type MakeFileDownloadData, type MakeFileUploadData, type MakeFileUploadRecordData } from './types.ts';
import { v4 as uuidv4 } from 'uuid';
import MediaUtils from '@/org.libersoft.messages/services/Media/MediaUtils.ts';
import _debug from 'debug';

const debug = _debug('libersoft:messages:services:FileUploadService');

export function makeFileUploadRecord(data: MakeFileUploadRecordData): IFileUploadRecord {
	const defaults = {
		id: uuidv4(),
		status: FileUploadRecordStatus.BEGUN,
		errorType: null,
		type: FileUploadRecordType.SERVER,
		fileOriginalName: '',
		fileMimeType: '',
		fileSize: 0,
		filePath: '',
		tempFilePath: '',
		chunkSize: 0,
		metadata: null,
	};
	return Object.assign(defaults, data);
}

export function makeFileUpload(data: MakeFileUploadData): IFileUpload {
	const defaults = {
		chunksSent: [],
		uploadInterval: null,
	};
	return Object.assign(defaults, data);
}

export function makeFileDownload(data: MakeFileDownloadData): IFileDownload {
	const defaults = {
		chunksReceived: [],
		data: null,
		running: false,
		createdAt: Date.now(),
	};
	return Object.assign(defaults, data);
}

export async function blobToBase64(blob: Blob): Promise<string> {
	const arrayBuffer = await blob.arrayBuffer(); // Get ArrayBuffer from the Blob
	return bytesToBase64(new Uint8Array(arrayBuffer));
}

export function bytesToBase64(bytes: Uint8Array): string {
	let binaryString = '';

	for (let i = 0; i < bytes.length; i++) {
		binaryString += String.fromCharCode(bytes[i]!); // Convert bytes to binary string
	}

	return btoa(binaryString); // Convert binary string to Base64
}

export async function base64ToUint8Array(base64: string): Promise<Uint8Array> {
	return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/* End-to-end integrity of a whole file.
 *
 * Per-chunk checksums prove that each chunk arrived intact, but not that the set of chunks is the
 * file the sender meant to send - the same untrusted peer supplies both the chunks and the metadata.
 * The file digest closes that: it is the hash of the concatenated per-chunk hashes, in order, so it
 * pins the content, the order and the chunk count.
 *
 * Hashing the chunk hashes rather than the bytes is deliberate: Web Crypto has no streaming digest,
 * so hashing the raw file would mean holding all of it in memory. This scheme is computed
 * incrementally as the chunks are read. */
export async function fileDigestFromChunkHashes(chunkHashes: string[]): Promise<string> {
	return sha256Hex(new TextEncoder().encode(chunkHashes.join('')));
}

/** True when the platform can hash at all. Integrity is mandatory, so this gates sending. */
export function isCryptoDigestAvailable(): boolean {
	return !!globalThis.crypto?.subtle;
}

/** Hex SHA-256 of a chunk payload, used as the per-chunk integrity checksum. */
export async function sha256Hex(data: Uint8Array | ArrayBuffer): Promise<string> {
	const subtle = globalThis.crypto?.subtle;
	/* Returning an empty string here used to let a sender build a message whose attachment the
	 * receiver then refused, because checksums are mandatory on that side. Fail where the problem
	 * is. */
	if (!subtle) throw new Error('Cryptographic hashing is unavailable in this environment');
	const buffer = data instanceof ArrayBuffer ? data : (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
	const digest = await subtle.digest('SHA-256', buffer);
	return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Triggers client file download by providing url or blob
 *
 * @param file {string | Blob} - url or blob
 * @param fileName - name of the file (this name will be used when downloading)
 */
export function assembleFile(file: string | Blob, fileName?: string): void {
	const downloadLink = document.createElement('a');
	const objectUrl = file instanceof Blob ? URL.createObjectURL(file) : null;
	downloadLink.href = objectUrl ?? (file as string);
	downloadLink.download = fileName || (file instanceof File ? file.name : 'unknown_file'); // fixme: file is (string | Blob), but Blob does not have name property
	downloadLink.target = '_blank';
	downloadLink.style.display = 'none';

	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);

	/* The browser has already started the save by the time click() returns, but the URL must outlive
	 * the current task, so it is released on the next macrotask instead of leaking for the session. */
	if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function transformFilesForServer(files: FileList): Promise<FileList> {
	for (let i = 0; i < files.length; i++) {
		const file = files[i]!;
		const mimeType = file.type;

		if (mimeType.startsWith('audio/')) {
			// console.log('transform audio file', file);

			// @ts-ignore TODO metadata typing
			file.metadata = await MediaUtils.getAudioDataFromArrayBuffer(await file.arrayBuffer());
		}

		if (mimeType.startsWith('video/')) {
			// console.log('transform audio file', file);

			let thumbnail: string | null = null;
			try {
				const thumbnailBlob = await MediaUtils.extractThumbnail(file);
				if (thumbnailBlob) {
					thumbnail = await blobToBase64(thumbnailBlob);
				}
			} catch (err) {
				console.error('Error extracting thumbnail', err);
				debug('Error extracting thumbnail', err);
			}
			// @ts-ignore TODO metadata typing
			file.metadata = { thumbnail };
		}
	}

	return files;
}
