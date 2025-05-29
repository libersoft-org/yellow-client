import videoJS from 'video.js';
import 'video.js/dist/video-js.css';
import type { MediaFileInfo, MediaLoader } from './loaders/types.ts';
import MP4Loader from './loaders/MP4Loader.ts';
import BasicStreamLoader from './loaders/BasicStreamLoader.ts';
import _debounce from 'lodash/debounce';
import WaveSurfer from 'wavesurfer.js';

class MediaService {
  videoElement: HTMLVideoElement;
  _getFileChunk: (args: { offsetBytes: number; chunkSize: number }) => Promise<{ chunk: { data: Uint8Array } }>;

  loader: MediaLoader | null = null;
  mediaSource: MediaSource | null = null;
  player: ReturnType<typeof videoJS> | null = null;
  fileInfo: MediaFileInfo;

  fetchQueue: number[] = [];
  fetchQueueInterval: any | null = null;

  constructor(videoElement: HTMLVideoElement, getFileChunk: MediaService['_getFileChunk'], fileInfo: MediaFileInfo) {
    this.videoElement = videoElement;
    this._getFileChunk = getFileChunk;
    this.fileInfo = fileInfo;
  }

  setupWavesurfer(element, options) {
    this.mediaSource = new MediaSource();
    const mediaSource = this.mediaSource as MediaSource;
    const url = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      let pickedLoader: MediaLoader | null = null;
      if (this.fileInfo.fileMime.startsWith('audio')) {
        pickedLoader = new BasicStreamLoader(mediaSource, this.fileInfo, this._getFileChunk);
      }

      // console.log('pickedLoader', pickedLoader);

      if (pickedLoader) {
        this.loader = pickedLoader;
        this.loader.setup(this.fileInfo).then(() => {
          this.fetchQueue.push(0);
          this.setupFetchQueue();
        });
      } else {
        console.error('Unsupported mime type', this.fileInfo);
      }
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

    // videoElement.onloadedmetadata = (...args) => {
    //  console.log('loaded meta data', args, videoElement.duration);
    // };

    player.ready(() => {
      // streaming
      if (this.shouldStream()) {
        this.mediaSource = new MediaSource();
        videoElement.src = URL.createObjectURL(this.mediaSource);
        const mediaSource = this.mediaSource as MediaSource;

        mediaSource.addEventListener('sourceopen', () => {
          let pickedLoader: MediaLoader | null = null;
          if (this.fileInfo.fileMime === 'video/mp4') {
            pickedLoader = new MP4Loader(mediaSource, this.fileInfo, this._getFileChunk);
          } else if (this.fileInfo.fileMime === 'video/webm') {
            pickedLoader = new BasicStreamLoader(mediaSource, this.fileInfo, this._getFileChunk);
          }

          if (pickedLoader) {
            this.loader = pickedLoader;
            this.loader.setup(this.fileInfo);
          } else {
            console.error('Unsupported mime type', this.fileInfo);
          }
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

        if (currentTime === 0) {
          this.fetchQueue.push(0);
        }
      } else {
        // pass
      }
    });

    const playEl = this.videoElement.parentNode?.querySelector('.vjs-big-play-button');
    const prep = () => {
      console.log('clickeeed!!!');
      this.downloadFullFile().then((blob) => {
        console.log('dw');
        videoElement.src = URL.createObjectURL(blob);
        player.play();
      });
    };

    playEl?.addEventListener('click', prep);
    playEl?.addEventListener('pointerdown', prep);

    const EVENTS = [
      'loadstart',
      'progress',
      'suspend',
      'abort',
      'error',
      'emptied',
      'stalled',
      'loadedmetadata',
      'loadeddata',
      'canplay',
      'canplaythrough',
      'playing',
      'waiting',
      'seeking',
      'seeked',
      'ended',
      'durationchange',
      'timeupdate',
      'play',
      'pause',
      'ratechange',
      'resize',
      'volumechange',
    ];
    EVENTS.forEach((evt) => {
      player.on(evt, () => console.log('test evt', evt));
    });

    this.videoElement.addEventListener('play', (evt) => {
      // code you want to happen when the video plays
      console.log('asdasdasdasdadasd');
    });

    const _seeking = _debounce(() => {
      this.seekTo(player.currentTime() as number);
    }, 1000);
    player.on('seeking', _seeking);

    return this.player;
  }

  async downloadFullFile() {
    const { chunkSize, totalSize, fileMime } = this.fileInfo;
    const chunks: Uint8Array[] = [];
    for (let offsetToFetch = 0; offsetToFetch < totalSize; offsetToFetch += chunkSize) {
      const { chunk } = await this._getFileChunk({ offsetBytes: offsetToFetch, chunkSize });
      chunks.push(chunk.data);
    }
    return new Blob(chunks, { type: fileMime });
  }

  shouldStream() {
    return ['video/mp4', 'video/webm'].includes(this.fileInfo.fileMime);
  }

  seekTo(time: number) {
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

  getLoader() {
    if (!this.loader) {
      throw new Error('Loader not set');
    }

    return this.loader;
  }

  async loadChunk(offset: number) {
    const { chunkSize, totalSize } = this.fileInfo;
    // TODO check if needed (in case of seek to history)
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
}

export default MediaService;
