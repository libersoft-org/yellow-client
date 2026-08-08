import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import { DOWNLOAD_ERROR_EVENT, FileDownloadService } from '../../services/Files/FileDownloadService.ts';
import { fileDigestFromChunkHashes, sha256Hex } from '../../services/Files/utils.ts';
import { FileUploadRecordStatus, type IFileDownload, type IFileUploadRecord } from '../../services/Files/types.ts';

/* Mirrors the real store: entries are addressed by an explicit transfer scope. */
function makeStore(): any {
	const store = writable<IFileDownload[]>([]);
	const matches = (d: IFileDownload, scope: any): boolean => d.record.id === scope.uploadId && d.accountKey === `${scope.server}\u0000${scope.accountId}`;
	return {
		store,
		getAll: (): IFileDownload[] => get(store),
		getAllForAccount: (accountKey: string): IFileDownload[] => get(store).filter(d => d.accountKey === accountKey),
		get: (scope: any): IFileDownload | undefined => (scope ? get(store).find(d => matches(d, scope)) : undefined),
		set: (scope: any, download: IFileDownload): void =>
			store.update(v => {
				const i = v.findIndex(d => matches(d, scope));
				if (i === -1) v.push(download);
				else v[i] = download;
				return [...v];
			}),
		patch: (): void => {},
		delete: (scope: any): void => store.update(v => v.filter(d => !matches(d, scope))),
		updateDownloadRecord: (): void => {},
		isAnyDownloadRunning: (): boolean => get(store).some(d => d.running),
	};
}

/* Owner of every transfer in this file - the services now require it explicitly. */
const OWNER = { accountId: 'account', server: 'wss://server.test', uploadId: 'upload-1' };

/* A fresh record per test: the service writes the terminal status onto record.status, so a shared
 * object would leak an ERROR state into the next test and make it skip the transfer entirely. */
function makeRecord(overrides: Partial<IFileUploadRecord> = {}): IFileUploadRecord {
	return {
		id: 'upload-1',
		status: FileUploadRecordStatus.BEGUN,
		fileOriginalName: 'f.bin',
		fileMimeType: 'application/octet-stream',
		fileSize: 8,
		chunkSize: 4,
		...overrides,
	} as IFileUploadRecord;
}

describe('FileDownloadService integrity checks', (): void => {
	beforeEach((): void => {
		vi.useRealTimers();
	});

	it('assembles a file whose chunks carry valid checksums', async (): Promise<void> => {
		const record = makeRecord();
		const service = new FileDownloadService(makeStore());
		const chunks = [new Uint8Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8])];
		record.metadata = { fileDigest: await fileDigestFromChunkHashes(await Promise.all(chunks.map(c => sha256Hex(c)))) } as any;
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => {
			const chunkId = offsetBytes / 4;
			const data = chunks[chunkId]!;
			return { chunk: { chunkId, uploadId: record.id, offsetBytes, checksum: await sha256Hex(data), data } };
		});
		/* chunksReceived is released right after the finish callback returns, so inspect it there. */
		let assembled: Uint8Array[] | null = null;
		await service.startDownloadSerial(
			[record],
			pullChunk as any,
			(d: IFileDownload): void => {
				assembled = [...d.chunksReceived];
			},
			OWNER
		);
		expect(pullChunk).toHaveBeenCalledTimes(2);
		expect(assembled).not.toBeNull();
		expect((assembled as unknown as Uint8Array[]).length).toBe(2);
		expect(Array.from((assembled as unknown as Uint8Array[])[1]!)).toEqual([5, 6, 7, 8]);
	});

	it('rejects an upload record with a zero chunk size instead of looping', async (): Promise<void> => {
		const service = new FileDownloadService(makeStore());
		await expect(service.startDownloadSerial([makeRecord({ chunkSize: 0 })], vi.fn() as any, vi.fn(), OWNER)).rejects.toThrow('Invalid chunk size');
	});

	it('never indexes the received array by a server-supplied chunk id', async (): Promise<void> => {
		const record = makeRecord();
		const store = makeStore();
		const service = new FileDownloadService(store);
		/* The server claims a huge chunk id; a sparse array of that length would be a memory DoS. */
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => {
			const data = new Uint8Array([1, 2, 3, 4]);
			return { chunk: { chunkId: 2 ** 30, uploadId: record.id, offsetBytes, checksum: '', data } };
		});
		const finish = vi.fn();
		await service.startDownloadSerial([record], pullChunk as any, finish, OWNER);
		const download = store.get(OWNER);
		expect(finish).not.toHaveBeenCalled();
		/* Mismatching chunk id is refused, so nothing is stored at all. */
		expect(download?.chunksReceived.length ?? 0).toBe(0);
	});

	it('refuses a chunk whose checksum does not match', async (): Promise<void> => {
		const record = makeRecord();
		const store = makeStore();
		const service = new FileDownloadService(store);
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => ({
			chunk: { chunkId: offsetBytes / 4, uploadId: record.id, offsetBytes, checksum: 'deadbeef', data: new Uint8Array([1, 2, 3, 4]) },
		}));
		const finish = vi.fn();
		await service.startDownloadSerial([record], pullChunk as any, finish, OWNER);
		expect(finish).not.toHaveBeenCalled();
		expect(store.get(OWNER)?.chunksReceived.length ?? 0).toBe(0);
	});

	/* A permanently failing transfer must leave the store and announce itself, otherwise whoever is
	 * waiting on it (FilesService) never settles and the queue stalls behind a dead entry. */
	it('removes a permanently failed download and emits an error', async (): Promise<void> => {
		vi.useFakeTimers();
		try {
			const record = makeRecord();
			const store = makeStore();
			const service = new FileDownloadService(store);
			const pullChunk = vi.fn(async () => {
				throw new Error('network down');
			});
			const errors: any[] = [];
			service.on(DOWNLOAD_ERROR_EVENT, e => errors.push(e));
			const started = service.startDownloadSerial([record], pullChunk as any, vi.fn(), OWNER);
			/* Exhaust the retry budget - the backoff is scheduled with setTimeout. */
			for (let i = 0; i < 12; i++) await vi.advanceTimersByTimeAsync(60_000);
			await started;
			expect(errors.length).toBe(1);
			expect(errors[0].uploadId).toBe(record.id);
			expect(errors[0].accountKey).toBe(`${OWNER.server}\u0000${OWNER.accountId}`);
			expect(errors[0].error).toBeInstanceOf(Error);
			expect(store.get(OWNER)).toBeUndefined();
		} finally {
			vi.useRealTimers();
		}
	});

	/* An EventEmitter with no listener for the event named 'error' rethrows the payload as an
	 * unhandled exception. downloadAttachmentsSerial() uses this service without attaching one, so
	 * the failure event must not use that name. */
	it('does not throw when a transfer fails with nobody listening', async (): Promise<void> => {
		vi.useFakeTimers();
		try {
			const record = makeRecord();
			const store = makeStore();
			const service = new FileDownloadService(store);
			const pullChunk = vi.fn(async () => {
				throw new Error('network down');
			});
			const started = service.startDownloadSerial([record], pullChunk as any, vi.fn(), OWNER);
			for (let i = 0; i < 12; i++) await vi.advanceTimersByTimeAsync(60_000);
			await expect(started).resolves.toBeUndefined();
			expect(store.get(OWNER)).toBeUndefined();
		} finally {
			vi.useRealTimers();
		}
	});

	/* Per-chunk hashes prove each piece arrived intact; the file digest proves the pieces are the
	 * file the sender meant to send, in the right order. */
	it('refuses a file whose assembled digest does not match the published one', async (): Promise<void> => {
		const record = makeRecord();
		record.metadata = { fileDigest: 'deadbeef' } as any;
		const store = makeStore();
		const service = new FileDownloadService(store);
		const chunks = [new Uint8Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8])];
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => {
			const chunkId = offsetBytes / 4;
			const data = chunks[chunkId]!;
			return { chunk: { chunkId, uploadId: record.id, offsetBytes, checksum: await sha256Hex(data), data } };
		});
		const finish = vi.fn();
		/* The last chunk arrived, so the failure surfaces to the caller rather than being retried. */
		await expect(service.startDownloadSerial([record], pullChunk as any, finish, OWNER)).rejects.toThrow('does not match the digest');
		expect(finish).not.toHaveBeenCalled();
	});

	it('refuses a chunk with no checksum now that verification is mandatory', async (): Promise<void> => {
		const record = makeRecord();
		const store = makeStore();
		const service = new FileDownloadService(store);
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => ({
			chunk: { chunkId: offsetBytes / 4, uploadId: record.id, offsetBytes, checksum: '', data: new Uint8Array([1, 2, 3, 4]) },
		}));
		const finish = vi.fn();
		await service.startDownloadSerial([record], pullChunk as any, finish, OWNER);
		expect(finish).not.toHaveBeenCalled();
	});

	/* An empty file has no chunks; asking for chunk 0 anyway made a valid transfer look corrupt. */
	it('completes a zero-byte file without fetching anything', async (): Promise<void> => {
		const record = makeRecord({ fileSize: 0 });
		/* A real sender publishes the digest of an empty chunk list. */
		record.metadata = { fileDigest: await fileDigestFromChunkHashes([]) } as any;
		const store = makeStore();
		const service = new FileDownloadService(store);
		const pullChunk = vi.fn();
		const finish = vi.fn();
		await service.startDownloadSerial([record], pullChunk as any, finish, OWNER);
		expect(pullChunk).not.toHaveBeenCalled();
		expect(finish).toHaveBeenCalledTimes(1);
		expect(store.get(OWNER)).toBeUndefined();
	});

	/* A record the server already declared dead must settle, not sit in the store forever. */
	it('refuses a zero-byte file that carries no digest', async (): Promise<void> => {
		const record = makeRecord({ fileSize: 0 });
		const store = makeStore();
		const service = new FileDownloadService(store);
		const finish = vi.fn();
		await service.startDownloadSerial([record], vi.fn() as any, finish, OWNER);
		expect(finish).not.toHaveBeenCalled();
		expect(store.get(OWNER)).toBeUndefined();
	});

	it('settles a transfer the server reports as ERROR', async (): Promise<void> => {
		const record = makeRecord({ status: FileUploadRecordStatus.ERROR });
		const store = makeStore();
		const service = new FileDownloadService(store);
		const errors: any[] = [];
		service.on(DOWNLOAD_ERROR_EVENT, e => errors.push(e));
		const finish = vi.fn();
		await service.startDownloadSerial([record], vi.fn() as any, finish, OWNER);
		expect(finish).not.toHaveBeenCalled();
		expect(errors.length).toBe(1);
		expect(errors[0].error.message).toContain('ERROR');
		expect(store.get(OWNER)).toBeUndefined();
	});

	/* A deterministic integrity failure cannot be fixed by waiting - it must not burn the backoff
	 * budget before giving up. */
	it('fails immediately on an integrity error instead of retrying', async (): Promise<void> => {
		const record = makeRecord();
		const store = makeStore();
		const service = new FileDownloadService(store);
		const errors: any[] = [];
		service.on(DOWNLOAD_ERROR_EVENT, e => errors.push(e));
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => ({
			chunk: { chunkId: offsetBytes / 4, uploadId: record.id, offsetBytes, checksum: 'deadbeef', data: new Uint8Array([1, 2, 3, 4]) },
		}));
		await service.startDownloadSerial([record], pullChunk as any, vi.fn(), OWNER);
		expect(pullChunk).toHaveBeenCalledTimes(1);
		expect(errors.length).toBe(1);
		expect(store.get(OWNER)).toBeUndefined();
	});

	it('refuses a chunk of unexpected length', async (): Promise<void> => {
		const record = makeRecord();
		const store = makeStore();
		const service = new FileDownloadService(store);
		const pullChunk = vi.fn(async ({ offsetBytes }: any) => ({
			chunk: { chunkId: offsetBytes / 4, uploadId: record.id, offsetBytes, checksum: '', data: new Uint8Array([1, 2]) },
		}));
		const finish = vi.fn();
		await service.startDownloadSerial([record], pullChunk as any, finish, OWNER);
		expect(finish).not.toHaveBeenCalled();
	});
});
