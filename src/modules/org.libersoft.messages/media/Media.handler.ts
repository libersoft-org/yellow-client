import videoJS from 'video.js';
import 'video.js/dist/video-js.css';
import type { MediaFileInfo, MediaLoader } from './loaders/types.ts';
import MP4Loader from './loaders/MP4.loader.ts';
import BasicLoader from './loaders/Basic.loader.ts';
import _debounce from 'lodash/debounce';

class MediaHandler {
 videoElement: HTMLVideoElement;
 _getFileChunk: (args: { offsetBytes: number; chunkSize: number }) => Promise<{ chunk: { data: Uint8Array } }>;

 loader: MediaLoader | null = null;
 mediaSource: MediaSource | null = null;
 player: ReturnType<typeof videoJS> | null = null;
 fileInfo: MediaFileInfo;

 fetchQueue: number[] = [];
 fetchQueueInterval: any | null = null;

 constructor(videoElement: HTMLVideoElement, getFileChunk: MediaHandler['_getFileChunk'], fileInfo: MediaFileInfo) {
  this.videoElement = videoElement;
  this._getFileChunk = getFileChunk;
  this.fileInfo = fileInfo;
 }

 setupVideo() {
  const videoElement = this.videoElement;
  this.player = videoJS(videoElement, {
   controls: true,
   autoplay: false,
   preload: 'none',
   seekable: false,
   fluid: true,
  });
  const player = this.player as ReturnType<typeof videoJS>;

  videoElement.onloadedmetadata = (...args) => {
   console.log('loaded meta data', args, videoElement.duration);
  };

  player.ready(() => {
   this.mediaSource = new MediaSource();
   videoElement.src = URL.createObjectURL(this.mediaSource);
   const mediaSource = this.mediaSource as MediaSource;

   mediaSource.addEventListener('sourceopen', () => {
    let pickedLoader: MediaLoader | null = null;
    if (this.fileInfo.fileMime === 'video/mp4') {
     pickedLoader = new MP4Loader(mediaSource, this.fileInfo, this._getFileChunk);
    } else if (this.fileInfo.fileMime === 'video/webm') {
     pickedLoader = new BasicLoader(mediaSource, this.fileInfo, this._getFileChunk);
    }

    if (pickedLoader) {
     this.loader = pickedLoader;
     this.loader.setup(this.fileInfo);
    } else {
     console.error('Unsupported mime type', this.fileInfo);
    }
   });
  });

  player.on('play', () => {
   const currentTime = player.currentTime();
   this.setupFetchQueue();

   if (currentTime === 0) {
    this.fetchQueue.push(0);
   }
  });

  const _seeking = _debounce(() => {
   this.seekTo(player.currentTime() as number);
  }, 1000);
  player.on('seeking', _seeking);

  return this.player;
 }

 seekTo(time: number) {
  const player = this.player as ReturnType<typeof videoJS>;
  const duration = player.duration();
  const loader = this.loader as MediaLoader;

  if (!duration || !time) {
   console.warn('Cannot seek yet');
   return;
  }

  const bitRate = this.fileInfo.totalSize / duration;
  const estimatedOffset = time * bitRate;
  const newOffset = estimatedOffset - (estimatedOffset % this.fileInfo.chunkSize);

  if (typeof loader.seek === 'function') {
   const seekOffset = loader.seek(time);
   this.fetchQueue = [];
   console.warn('111 pushing to que 222', seekOffset);
   this.fetchQueue.push(seekOffset);
  }
 }

 getLoader() {
  if (!this.loader) {
   throw new Error('Loader not set');
  }

  return this.loader;
 }

 async loadChunk(offset: number) {
  const { chunkSize, totalSize } = this.fileInfo;
  // todo check if needed (in case of seek to history)
  // const mediaSource = this.mediaSource as MediaSource;
  // if (offset >= totalSize) {
  //  //mediaSource.endOfStream();
  // }

  if (this.isOffsetInBuffer(offset)) {
   //console.warn('offset already in buffer', offset);
   return;
  }

  try {
   const { chunk } = await this._getFileChunk({ offsetBytes: offset, chunkSize });
   const data = chunk.data as Uint8Array<ArrayBuffer>;
   const nextOffset = this.getLoader().processChunk({ offset, chunkSize, data });
   if (typeof nextOffset === 'number' && nextOffset < totalSize) {
    this.fetchQueue.push(nextOffset);
   }
  } catch (error) {
   console.error('Error loading chunk:', error);
  }
 }

 isOffsetInBuffer(offset: number) {
  const buffered = this.videoElement.buffered;
  for (let i = 0; i < buffered.length; i++) {
   if (offset >= buffered.start(i) && offset <= buffered.end(i)) {
    return true;
   }
  }
  return false;
 }

 setupFetchQueue() {
  if (this.fetchQueueInterval) {
   return;
  }
  this.fetchQueueInterval = setInterval(() => {
   if (!this.fetchQueue.length) {
    return;
   }

   const offset = this.fetchQueue.pop() as number;
   this.loadChunk(offset);
  }, 100);
 }

 async prefetch() {
  this.prefeching = true;
  console.log('prefetch');
  const prefetchSeconds = 50;
  const player = this.player as ReturnType<typeof videoJS>;
  const currentTime = player.currentTime();
  const duration = player.duration();
  const bitRate = this.fileInfo.totalSize / duration;
  const estimatedOffset = currentTime * bitRate;
  const newOffset = estimatedOffset - (estimatedOffset % this.fileInfo.chunkSize);
  const prefetchOffset = newOffset + prefetchSeconds * bitRate;
  // now load chunks from newOffset to prefetchOffset
  for (let offset = newOffset; offset < prefetchOffset; offset += this.fileInfo.chunkSize) {
   this.loadChunk(offset);
  }
 }
}

export default MediaHandler;
