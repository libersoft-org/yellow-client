import videoJS from 'video.js';
import 'video.js/dist/video-js.css';
import type { IMediaFileInfo, MediaLoader } from './loaders/types.ts';
import MP4Loader from './loaders/MP4Loader.ts';
import BasicStreamLoader from './loaders/BasicStreamLoader.ts';
import _debounce from 'lodash/debounce';
import WaveSurfer from 'wavesurfer.js';

/** How many times one byte offset is re-queued before the stream is declared broken. */
const MAX_OFFSET_ATTEMPTS = 3;

class MediaService {
	videoElement: HTMLVideoElement;
	_getFileChunk: (args: { offsetBytes: number; chunkSize: number }) => Promise<{ chunk: { data: Uint8Array } }>;
	loader: MediaLoader | null = null;
	mediaSource: MediaSource | null = null;
	player: ReturnType<typeof videoJS> | null = null;
	fileInfo: IMediaFileInfo;
	fetchQueue: number[] = [];
	fetchQueueInterval: any | null = null;
	private _cleanupListeners: Array<() => void> = [];
	/* Every object URL handed to an element has to be revoked, otherwise the Blob behind it stays
	 * alive for the lifetime of the document. */
	private _objectUrls: string[] = [];
	/* Byte offsets already fetched successfully. video.buffered is measured in seconds and cannot
	 * answer this. Offsets currently being requested are tracked separately: marking an offset as
	 * fetched before its request completes meant a failed chunk was never retried and playback
	 * stalled with no error. */
	private _fetchedOffsets = new Set<number>();
	private _inFlightOffsets = new Set<number>();
	/** Reported once when a chunk can no longer be recovered, so the UI can stop waiting. */
	onStreamError: ((error: unknown) => void) | null = null;
	private _fullDownload: Promise<Blob> | null = null;
	/** Failed attempts per offset, so a permanently broken chunk stops being retried. */
	private _offsetAttempts = new Map<number, number>();

	constructor(videoElement: HTMLVideoElement, getFileChunk: MediaService['_getFileChunk'], fileInfo: IMediaFileInfo) {
		this.videoElement = videoElement;
		this._getFileChunk = getFileChunk;
		this.fileInfo = fileInfo;
	}

	private createObjectUrl(source: Blob | MediaSource): string {
		const url = URL.createObjectURL(source as any);
		this._objectUrls.push(url);
		return url;
	}

	setupWavesurfer(element, options): WaveSurfer {
		this.mediaSource = new MediaSource();
		const mediaSource = this.mediaSource as MediaSource;
		const url = this.createObjectUrl(mediaSource);
		mediaSource.addEventListener('sourceopen', () => {
			let pickedLoader: MediaLoader | null = null;
			if (this.fileInfo.fileMime.startsWith('audio')) pickedLoader = new BasicStreamLoader(mediaSource, this.fileInfo, this._getFileChunk);
			// console.log('pickedLoader', pickedLoader);
			if (pickedLoader) {
				this.loader = pickedLoader;
				this.loader.setup(this.fileInfo).then(() => {
					this.fetchQueue.push(0);
					this.setupFetchQueue();
				});
			} else console.error('Unsupported mime type', this.fileInfo);
		});
		const wavesurfer = WaveSurfer.create({
			sampleRate: 48000,
			container: element,
			waveColor: '#999',
			progressColor: '#ea0',
			barWidth: 3,
			//responsive: true,
			height: 50,
			autoplay: false,
			url,
			duration: options.duration,
			peaks: options.peaks,
		});
		// @ts-ignore
		this.videoElement = wavesurfer.media;
		return wavesurfer;
	}

	setupVideo(): ReturnType<typeof videoJS> | null {
		const videoElement = this.videoElement;
		this.player = videoJS(videoElement, {
			controls: true,
			autoplay: false,
			preload: 'none',
			seekable: false,
			fluid: true,
		});
		const player = this.player as ReturnType<typeof videoJS>;
		// videoElement.onloadedmetadata = (...args) => {
		//  console.log('loaded meta data', args, videoElement.duration);
		// };
		player.ready(() => {
			// streaming
			if (this.shouldStream()) {
				this.mediaSource = new MediaSource();
				videoElement.src = this.createObjectUrl(this.mediaSource);
				const mediaSource = this.mediaSource as MediaSource;
				mediaSource.addEventListener('sourceopen', () => {
					let pickedLoader: MediaLoader | null = null;
					if (this.fileInfo.fileMime === 'video/mp4') pickedLoader = new MP4Loader(mediaSource, this.fileInfo, this._getFileChunk);
					else if (this.fileInfo.fileMime === 'video/webm') pickedLoader = new BasicStreamLoader(mediaSource, this.fileInfo, this._getFileChunk);
					if (pickedLoader) {
						this.loader = pickedLoader;
						this.loader.setup(this.fileInfo);
					} else console.error('Unsupported mime type', this.fileInfo);
				});
			}
			// full download, then play
			else {
				// pass
				console.log('pass');
				//this.mediaSource = new MediaSource();
				//videoElement.src = URL.createObjectURL(this.mediaSource);
			}
		});

		player.on('play', () => {
			console.log('on play');
			if (this.shouldStream()) {
				const currentTime = player.currentTime();
				this.setupFetchQueue();
				if (currentTime === 0) this.fetchQueue.push(0);
			} else {
				// pass
			}
		});
		const playEl = this.videoElement.parentNode?.querySelector('.vjs-big-play-button');
		/* Only one entry point: 'pointerdown' and 'click' both fire for a single tap, and each used to
		 * start its own full download. Streaming formats are served by the fetch queue instead, so the
		 * two paths never run at the same time either. */
		const prep = () => {
			if (this.shouldStream()) return;
			this.downloadFullFile()
				.then(blob => {
					videoElement.src = this.createObjectUrl(blob);
					void player.play();
				})
				.catch(error => console.error('Failed to download media file:', error));
		};
		playEl?.addEventListener('click', prep);
		if (playEl) this._cleanupListeners.push(() => playEl.removeEventListener('click', prep));
		const EVENTS = ['loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 'stalled', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'seeking', 'seeked', 'ended', 'durationchange', 'timeupdate', 'play', 'pause', 'ratechange', 'resize', 'volumechange'];
		EVENTS.forEach(evt => {
			player.on(evt, () => console.log('test evt', evt));
		});
		const onPlay = (_evt: Event) => {
			console.log('Video\telement play event');
		};
		this.videoElement.addEventListener('play', onPlay);
		this._cleanupListeners.push(() => this.videoElement.removeEventListener('play', onPlay));
		const _seeking = _debounce(() => {
			this.seekTo(player.currentTime() as number);
		}, 1000);
		player.on('seeking', _seeking);
		return this.player;
	}

	async downloadFullFile(): Promise<Blob> {
		/* Deduplicate concurrent callers - a second click must not start a second download. */
		if (this._fullDownload) return this._fullDownload;
		this._fullDownload = this.doDownloadFullFile().finally(() => {
			this._fullDownload = null;
		});
		return this._fullDownload;
	}

	private async doDownloadFullFile(): Promise<Blob> {
		const { chunkSize, totalSize, fileMime } = this.fileInfo;
		/* A zero or negative chunk size would never advance the offset and loop forever. */
		if (!Number.isFinite(chunkSize) || chunkSize <= 0) throw new Error('Invalid chunk size in media file info');
		if (!Number.isFinite(totalSize) || totalSize < 0) throw new Error('Invalid total size in media file info');
		const chunks: Uint8Array[] = [];
		for (let offsetToFetch = 0; offsetToFetch < totalSize; offsetToFetch += chunkSize) {
			const { chunk } = await this._getFileChunk({ offsetBytes: offsetToFetch, chunkSize });
			chunks.push(chunk.data);
		}
		return new Blob(chunks as BlobPart[], { type: fileMime });
	}

	shouldStream(): boolean {
		return ['video/mp4', 'video/webm'].includes(this.fileInfo.fileMime);
	}

	seekTo(time: number): void {
		const player = this.player as ReturnType<typeof videoJS>;
		const duration = player.duration();
		const loader = this.loader as MediaLoader;
		if (!duration || !time) {
			console.warn('Cannot seek yet');
			return;
		}
		// const bitRate = this.fileInfo.totalSize / duration;
		// const estimatedOffset = time * bitRate;
		// const newOffset = estimatedOffset - (estimatedOffset % this.fileInfo.chunkSize);
		if (typeof loader.seek === 'function') {
			const seekOffset = loader.seek(time);
			this.fetchQueue = [];
			this.fetchQueue.push(seekOffset);
		}
	}

	getLoader(): MediaLoader {
		if (!this.loader) throw new Error('Loader not set');
		return this.loader;
	}

	async loadChunk(offset: number): Promise<void> {
		const { chunkSize, totalSize } = this.fileInfo;
		// TODO check if needed (in case of seek to history)
		// const mediaSource = this.mediaSource as MediaSource;
		// if (offset >= totalSize) {
		//  //mediaSource.endOfStream();
		// }
		if (this.isOffsetInBuffer(offset) || this._inFlightOffsets.has(offset)) {
			//console.warn('offset already fetched or in flight', offset);
			return;
		}
		this._inFlightOffsets.add(offset);
		try {
			const { chunk } = await this._getFileChunk({ offsetBytes: offset, chunkSize });
			const data = chunk.data as Uint8Array<ArrayBuffer>;
			const nextOffset = this.getLoader().processChunk({ offset, chunkSize, data });
			/* Only now is the offset really available - promoting it earlier made a failed request
			 * look like a successful one forever. */
			this._fetchedOffsets.add(offset);
			if (typeof nextOffset === 'number' && nextOffset < totalSize) this.fetchQueue.push(nextOffset);
		} catch (error) {
			console.error('Error loading chunk:', error);
			/* Put it back on the queue so the stream can recover from a transient failure. */
			const attempts = (this._offsetAttempts.get(offset) ?? 0) + 1;
			this._offsetAttempts.set(offset, attempts);
			if (attempts < MAX_OFFSET_ATTEMPTS) this.fetchQueue.push(offset);
			else {
				console.error('Giving up on media chunk at offset', offset);
				this.onStreamError?.(error);
			}
		} finally {
			this._inFlightOffsets.delete(offset);
		}
	}

	/* Byte offsets, not playback time: video.buffered is expressed in seconds, so comparing a byte
	 * offset against it produced meaningless results and re-fetched data that was already loaded. */
	isOffsetInBuffer(offset: number): boolean {
		return this._fetchedOffsets.has(offset);
	}

	setupFetchQueue(): void {
		if (this.fetchQueueInterval) return;
		this.fetchQueueInterval = setInterval(() => {
			if (!this.fetchQueue.length) return;
			const offset = this.fetchQueue.pop() as number;
			this.loadChunk(offset);
		}, 100);
	}

	destroy(): void {
		if (this.fetchQueueInterval) {
			clearInterval(this.fetchQueueInterval);
			this.fetchQueueInterval = null;
		}
		this.fetchQueue = [];
		this._fetchedOffsets.clear();
		this._inFlightOffsets.clear();
		this._offsetAttempts.clear();
		for (const cleanup of this._cleanupListeners) cleanup();
		this._cleanupListeners = [];
		for (const url of this._objectUrls) URL.revokeObjectURL(url);
		this._objectUrls = [];
		if (this.player) {
			this.player.dispose();
			this.player = null;
		}
		this.loader = null;
		this.mediaSource = null;
	}
}

export default MediaService;
