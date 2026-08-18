import Dexie from 'dexie';
//import type { FileUploadChunk } from '@/org.libersoft.messages/services/Files/types.ts';

export const FILES_DB_KEY = 'files';

export enum LocalFileStatus {
	INIT = 'INIT',
	DOWNLOADING = 'DOWNLOADING',
	READY = 'READY',
}

export interface ILocalFile {
	id: number;
	/** Owning account scope - see services/Files/accountScope.ts. */
	accountKey: string;
	localFileStatus: LocalFileStatus;
	fileTransferId: string;
	fileOriginalName: string;
	fileMimeType: string;
	fileSize: number;
	fileBlob?: Blob;
}

export class FilesLocalDB extends Dexie {
	files!: Dexie.Table<ILocalFile, number>;
	// filesChunks!: Dexie.Table<LocalFileChunk, number>;

	constructor() {
		super(FILES_DB_KEY);
		/* v1 keyed rows by fileTransferId alone, which is only unique per server, and declared a string
		 * primary key while the model (and every delete call) used a numeric id. Both are fixed here.
		 * The old table is dropped rather than migrated: its rows carry no account attribution, so they
		 * cannot be assigned to an account safely. The table is a cache - the files are re-downloadable. */
		this.version(1).stores({
			files: 'fileTransferId, internalStatus, fileOriginalName, fileMimeType, fileSize',
		});
		this.version(2).stores({
			files: null,
			localFiles: '++id, &[accountKey+fileTransferId], accountKey, fileTransferId, localFileStatus',
		});
		this.files = this.table('localFiles');
	}

	async addFile(file: Omit<ILocalFile, 'id'>): Promise<number> {
		return this.files.add(file as ILocalFile);
	}

	async findFile(accountKey: string, fileTransferId: string): Promise<ILocalFile | undefined> {
		return this.files.where({ accountKey, fileTransferId }).first();
	}

	async updateFile(accountKey: string, fileTransferId: string, update: Partial<ILocalFile>): Promise<number> {
		return await this.files.where({ accountKey, fileTransferId }).modify(update);
	}

	async deleteFile(id: number): Promise<void> {
		return this.files.delete(id);
	}
}

const filesDB = new FilesLocalDB();
export default filesDB;
