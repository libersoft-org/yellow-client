export type NextByteOffset = number;

export interface IMediaFileInfo {
	id: string;
	fileMime: string;
	chunkSize: number;
	totalSize: number;
}

export abstract class MediaLoader {
	mediaSource: MediaSource;
	mediaFileInfo: IMediaFileInfo;
	getFileChunk: any;

	constructor(mediaSource: MediaSource, mediaFileInfo: IMediaFileInfo, getFileChunk: any) {
		this.mediaSource = mediaSource;
		this.mediaFileInfo = mediaFileInfo;
		this.getFileChunk = getFileChunk;
	}

	abstract setup(mediaFileInfo: IMediaFileInfo): Promise<void>;
	// abstract loadChunk(offset: number): Promise<Uint8Array>;
	abstract processChunk(chunk: { offset: number; chunkSize: number; data: Uint8Array<ArrayBuffer> }): NextByteOffset | void;

	seek?: (time: number) => NextByteOffset;
}
