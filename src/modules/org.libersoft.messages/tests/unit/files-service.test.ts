import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
import type { IFileDownload, IFileUploadRecord } from '../../services/Files/types.ts';

const mocks = vi.hoisted(() => ({
	findFile: vi.fn(),
	addFile: vi.fn(),
	updateFile: vi.fn(),
	deleteFile: vi.fn(),
	loadUploadData: vi.fn(),
}));

vi.mock('@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts', (): any => ({
	LocalFileStatus: { INIT: 'INIT', DOWNLOADING: 'DOWNLOADING', READY: 'READY' },
	default: {
		findFile: mocks.findFile,
		addFile: mocks.addFile,
		updateFile: mocks.updateFile,
		deleteFile: mocks.deleteFile,
		files: { delete: mocks.deleteFile, where: vi.fn() },
	},
}));

vi.mock('@/core/scripts/core.ts', async (): Promise<any> => {
	const { writable: makeWritable } = await import('svelte/store');
	return {
		active_account: makeWritable({ id: 'account', credentials: { server: 'wss://server.test' } }),
	};
});

vi.mock('@/org.libersoft.messages/scripts/messages.ts', (): any => ({
	loadUploadData: mocks.loadUploadData,
	makeDownloadChunkAsyncFn: vi.fn((): (() => Promise<never>) => async (): Promise<never> => {
		throw new Error('Unused pull chunk mock');
	}),
}));

vi.mock('@/org.libersoft.messages/services/Files/FileUploadService.ts', (): any => ({ default: {} }));
vi.mock('@/org.libersoft.messages/services/Files/FileDownloadService.ts', (): any => ({
	default: {},
	/* FilesService listens for this event name - keep the mock in step with the real module. */
	DOWNLOAD_ERROR_EVENT: 'download-error',
}));

import { FilesService } from '../../services/Files/FilesService.ts';

/* Must match accountScopeKey() for the mocked active account. */
const ACCOUNT_KEY = 'wss://server.test\u0000account';

const record: IFileUploadRecord = {
	id: 'upload',
	fileOriginalName: 'file.txt',
	fileMimeType: 'text/plain',
	fileSize: 4,
	chunkSize: 4,
} as IFileUploadRecord;

function makeDownloadManager(): any {
	const downloads = new Map<string, IFileDownload>();
	const store = writable<IFileDownload[]>([]);
	const listeners = new Map<string, Set<(payload: any) => void>>();
	return {
		/* FilesService listens for terminal failures so it can reject with the real cause. */
		on: (event: string, fn: (payload: any) => void): void => {
			if (!listeners.has(event)) listeners.set(event, new Set());
			listeners.get(event)!.add(fn);
		},
		off: (event: string, fn: (payload: any) => void): void => {
			listeners.get(event)?.delete(fn);
		},
		emit: (event: string, payload: any): void => {
			for (const fn of listeners.get(event) ?? []) fn(payload);
		},
		downloadStore: {
			store,
			/* The real store is addressed by an explicit transfer scope now. */
			get: (scope: any): IFileDownload | undefined => (scope ? downloads.get(scope.uploadId) : undefined),
		},
		startDownloadSerial: async (_records: IFileUploadRecord[], _pullChunk: unknown, finish: (download: IFileDownload) => void | Promise<void>, _owner?: unknown): Promise<void> => {
			const download = { record, chunksReceived: [new Uint8Array([1, 2, 3, 4])] } as IFileDownload;
			downloads.set(record.id, download);
			store.set([download]);
			await finish(download);
			downloads.delete(record.id);
			store.set([]);
		},
	};
}

describe('FilesService', (): void => {
	beforeEach((): void => {
		vi.clearAllMocks();
		mocks.findFile.mockResolvedValue(undefined);
		mocks.addFile.mockResolvedValue(1);
		mocks.updateFile.mockResolvedValue(1);
		mocks.deleteFile.mockResolvedValue(undefined);
		mocks.loadUploadData.mockResolvedValue({ record });
	});

	it('persists READY and the downloaded Blob before resolving', async (): Promise<void> => {
		const service = new FilesService({} as any, makeDownloadManager());
		const result = await service.getOrDownloadAttachment(record.id);
		expect(mocks.updateFile).toHaveBeenCalledWith(ACCOUNT_KEY, record.id, {
			localFileStatus: 'READY',
			fileBlob: expect.any(Blob),
		});
		expect(result.localFile).toMatchObject({
			id: 1,
			accountKey: ACCOUNT_KEY,
			fileTransferId: record.id,
			localFileStatus: 'READY',
		});
		expect(result.localFile.fileBlob).toBeInstanceOf(Blob);
	});

	it('rejects IndexedDB failures instead of leaving the request pending', async (): Promise<void> => {
		mocks.findFile.mockRejectedValue(new Error('IndexedDB failed'));
		const service = new FilesService({} as any, makeDownloadManager());
		await expect(service.getOrDownloadAttachment(record.id)).rejects.toThrow('IndexedDB failed');
	});

	it('rejects when persisting READY fails', async (): Promise<void> => {
		mocks.updateFile.mockRejectedValue(new Error('READY persistence failed'));
		const service = new FilesService({} as any, makeDownloadManager());
		await expect(service.getOrDownloadAttachment(record.id)).rejects.toThrow('READY persistence failed');
	});
});
