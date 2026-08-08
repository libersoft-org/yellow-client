import { describe, expect, it } from 'vitest';
import { FileDownloadStore } from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
import { FileUploadStore } from '@/org.libersoft.messages/stores/FileUploadStore.ts';
import { scopeAccountKey, type ITransferScope } from '@/org.libersoft.messages/services/Files/accountScope.ts';
import type { IFileDownload, IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';

/* Two accounts on two servers that happen to hand out the same upload id. Before transfers carried
 * an immutable scope, this collision let one account read, patch and delete the other's transfer. */
const A: ITransferScope = { accountId: 'acc-a', server: 'wss://a.test', uploadId: 'same-id' };
const B: ITransferScope = { accountId: 'acc-b', server: 'wss://b.test', uploadId: 'same-id' };

function download(scope: ITransferScope, name: string): IFileDownload {
	return {
		record: { id: scope.uploadId, fileOriginalName: name } as any,
		accountKey: scopeAccountKey(scope),
		chunksReceived: [],
		data: null,
		createdAt: 0,
		running: false,
	};
}

function upload(scope: ITransferScope, name: string): IFileUpload {
	return {
		role: 'SENDER' as any,
		file: null,
		acc: null,
		accountKey: scopeAccountKey(scope),
		record: { id: scope.uploadId, fileOriginalName: name } as any,
		chunksSent: [],
		uploadInterval: null,
	};
}

describe('transfer scoping', (): void => {
	it('keeps two accounts with the same upload id apart in the download store', (): void => {
		const store = new FileDownloadStore();
		store.set(A, download(A, 'a.bin'));
		store.set(B, download(B, 'b.bin'));

		expect(store.get(A)?.record.fileOriginalName).toBe('a.bin');
		expect(store.get(B)?.record.fileOriginalName).toBe('b.bin');
		expect(store.getAll().length).toBe(2);
	});

	it('deletes only the transfer of the account that asked', (): void => {
		const store = new FileDownloadStore();
		store.set(A, download(A, 'a.bin'));
		store.set(B, download(B, 'b.bin'));

		store.delete(A);

		expect(store.get(A)).toBeUndefined();
		expect(store.get(B)?.record.fileOriginalName).toBe('b.bin');
	});

	it('patches only the transfer of the account that asked', (): void => {
		const store = new FileDownloadStore();
		store.set(A, download(A, 'a.bin'));
		store.set(B, download(B, 'b.bin'));

		store.patch(A, { running: true });

		expect(store.get(A)?.running).toBe(true);
		expect(store.get(B)?.running).toBe(false);
	});

	it('applies the same isolation to uploads', (): void => {
		const store = new FileUploadStore();
		store.set(A, upload(A, 'a.bin'));
		store.set(B, upload(B, 'b.bin'));

		expect(store.get(A)?.record.fileOriginalName).toBe('a.bin');
		expect(store.get(B)?.record.fileOriginalName).toBe('b.bin');
		expect(store.getAllForAccount(scopeAccountKey(A)).length).toBe(1);
	});

	it('returns nothing when there is no scope at all', (): void => {
		const store = new FileDownloadStore();
		store.set(A, download(A, 'a.bin'));
		expect(store.get(null)).toBeUndefined();
	});
});
