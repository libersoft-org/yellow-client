import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import { FileDownloadService } from '../../services/Files/FileDownloadService.ts';
import { sha256Hex } from '../../services/Files/utils.ts';
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

const record: IFileUploadRecord = {
	id: 'upload-1',
	status: FileUploadRecordStatus.BEGUN,
	fileOriginalName: 'f.bin',
	fileMimeType: 'application/octet-stream',
	fileSize: 8,
	chunkSize: 4,
} as IFileUploadRecord;

describe('FileDownloadService integrity checks', (): void => {
	beforeEach((): void => {
		vi.useRealTimers();
	});

	it('assembles a file whose chunks carry valid checksums', async (): Promise<void> => {
		const service = new FileDownloadService(makeStore());
		const chunks = [new Uint8Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8])];
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
		await expect(service.startDownloadSerial([{ ...record, chunkSize: 0 }], vi.fn() as any, vi.fn(), OWNER)).rejects.toThrow('Invalid chunk size');
	});

	it('never indexes the received array by a server-supplied chunk id', async (): Promise<void> => {
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
			const store = makeStore();
			const service = new FileDownloadService(store);
			const pullChunk = vi.fn(async () => {
				throw new Error('network down');
			});
			const errors: any[] = [];
			service.on('error', e => errors.push(e));
			const started = service.startDownloadSerial([record], pullChunk as any, vi.fn(), OWNER);
			/* Exhaust the retry budget - the backoff is scheduled with setTimeout. */
			for (let i = 0; i < 12; i++) await vi.advanceTimersByTimeAsync(60_000);
			await started;
			expect(errors.length).toBe(1);
			expect(errors[0].uploadId).toBe(record.id);
			expect(errors[0].error).toBeInstanceOf(Error);
			expect(store.get(OWNER)).toBeUndefined();
		} finally {
			vi.useRealTimers();
		}
	});

	it('refuses a chunk of unexpected length', async (): Promise<void> => {
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
