declare module '@webav/mp4box.js' {
	interface IMP4MediaTrack {
		id: number;
		type: 'video' | 'audio' | string;
		created: Date;
		modified: Date;
		movie_duration: number;
		layer: number;
		alternate_group: number;
		volume: number;
		track_width: number;
		track_height: number;
		timescale: number;
		duration: number;
		bitrate: number;
		codec: string;
		language: string;
		nb_samples: number;
	}

	interface IMP4VideoData {
		width: number;
		height: number;
	}

	interface IMP4VideoTrack extends IMP4MediaTrack {
		video: IMP4VideoData;
	}

	interface IMP4AudioData {
		sample_rate: number;
		channel_count: number;
		sample_size: number;
	}

	interface IMP4AudioTrack extends IMP4MediaTrack {
		audio: IMP4AudioData;
	}

	type MP4Track = IMP4VideoTrack | IMP4AudioTrack;

	interface IMP4Info {
		duration: number;
		timescale: number;
		fragment_duration: number;
		isFragmented: boolean;
		isProgressive: boolean;
		hasIOD: boolean;
		brands: string[];
		created: Date;
		modified: Date;
		tracks: MP4Track[];
		videoTracks: IMP4VideoTrack[];
		audioTracks: IMP4AudioTrack[];
	}

	export type MP4ArrayBuffer = ArrayBuffer & { fileStart: number };

	interface IMP4Sample {
		number: number;
		track_id: number;
		description: any;
		is_rap: boolean;
		timescale: number;
		dts: number;
		cts: number;
		duration: number;
		size: number;
		data: MP4ArrayBuffer;
		is_sync: boolean;
	}

	export interface IMP4File {
		onMoovStart?: () => void;
		onReady?: (info: IMP4Info) => void;
		onError?: (e: string) => void;

		onSamples?: (id: number, user: any, samples: IMP4Sample[]) => void;

		setExtractionOptions(track_id: number, user: any, options: { nbSamples?: number; rapAlignement?: boolean }): void;

		unsetExtractionOptions(track_id: number): void;

		seek(timeSec: number, useRap: boolean = true): { time: number; offset: number };

		appendBuffer(data: MP4ArrayBuffer): number;
		start(): void;
		stop(): void;
		flush(): void;
	}

	export function createFile(): IMP4File;
}
