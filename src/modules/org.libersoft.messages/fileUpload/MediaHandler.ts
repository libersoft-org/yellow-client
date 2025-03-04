import videoJS from 'video.js';
import 'video.js/dist/video-js.css';
import mp4box from '@webav/mp4box.js';

export async function extractThumbnail(fileChunk) {
 return new Promise((resolve, reject) => {
  const url = URL.createObjectURL(fileChunk);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.crossOrigin = 'anonymous';
  video.playsInline = true;

  video.addEventListener('loadeddata', () => {
   video.currentTime = Math.min(1, video.duration / 2); // Seek to 1s or middle of video
  });

  video.addEventListener('seeked', () => {
   const canvas = document.createElement('canvas');
   canvas.width = video.videoWidth;
   canvas.height = video.videoHeight;
   const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

   canvas.toBlob(blob => {
    URL.revokeObjectURL(url);
    resolve(blob);
   }, 'image/png');
  });

  video.addEventListener('error', err => {
   URL.revokeObjectURL(url);
   reject(err);
  });
 });
}

class MediaHandler {
 videoElement: HTMLVideoElement;
 getFileChunk: (args: { offsetBytes: number; chunkSize: number }) => Promise<{ chunk: { data: Uint8Array } }>;

 mediaSource: MediaSource | null;
 sourceBuffer: SourceBuffer | null;
 player: ReturnType<typeof videoJS> | null;
 mp4boxfile: typeof mp4box | null;
 nextBufferStart = 0;

 fileInfo: {
  id: string;
  fileMime: string;
  chunkSize: number;
  totalSize: number;
 };

 constructor(videoElement: HTMLVideoElement, getFileChunk: MediaHandler['getFileChunk'], fileInfo: MediaHandler['fileInfo']) {
  this.videoElement = videoElement;
  this.getFileChunk = getFileChunk;

  this.sourceBuffer = null;
  this.mediaSource = null;
  this.fileInfo = fileInfo;
  this.player = null;
  this.mp4boxfile = null;
 }

 startVideoWhole() {
  const videoElement = this.videoElement;
  const player = videoJS(videoElement, {
   controls: true,
   autoplay: false,
   preload: 'none',
  });

  player.ready(() => {
   this.getFileChunk({ offsetBytes: 0, chunkSize: 1024 * 1024 * 20 }).then(({ chunk }) => {
    //console.log('loaded whole chunk', chunk, this.fileInfo);
    videoElement.src = URL.createObjectURL(new Blob([chunk.data], { type: this.fileInfo.fileMime }));
   });
  });
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

  player.ready(() => {
   this.mediaSource = new MediaSource();
   videoElement.src = URL.createObjectURL(this.mediaSource);
   const mediaSource = this.mediaSource as MediaSource;
   // mediaSource.duration = this.fileInfo.totalSize

   mediaSource.addEventListener('sourceopen', () => {
    let mime = '';
    if (this.fileInfo.fileMime === 'video/mp4') {
     this.setupMP4Box();
     return;
    } else if (this.fileInfo.fileMime === 'video/webm') {
     mime = 'video/webm; codecs="vp8, vorbis"';
    } else if (this.fileInfo.fileMime === 'video/ogg') {
     mime = 'video/ogg; codecs="theora, opus"';
    } else if (this.fileInfo.fileMime === 'audio/ogg') {
     mime = 'audio/ogg; codecs="theora, vorbis"';
    }
    // mediaSource.duration = this.fileInfo.totalSize

    if (mime) {
     //console.info('Media Handler: mime type picked:', mime);
     this.sourceBuffer = mediaSource.addSourceBuffer(mime);
    } else {
     //console.error('Unsupported mime type' + this.fileInfo.fileMime)
    }
   });
  });

  player.on('play', async (...args) => {
   //console.log('play', args);
   this.loadChunk(0);
  });

  return this.player;
 }

 async setupMP4Box() {
  const mp4boxfile = mp4box.createFile();
  this.mp4boxfile = mp4boxfile;

  //console.info('MP4BOX: started');

  mp4boxfile.onError = function (e) {
   //console.info('MP4BOX: error', e);
  };

  mp4boxfile.onReady = async info => {
   //console.info('MP4BOX: onReady INFO', info);
   const mediaSource = this.mediaSource as MediaSource;
   mediaSource.duration = info.duration / info.timescale;

   mp4boxfile.onSegment = (id, user, buffer, sampleNumber, last) => {
    //console.info('MP4BOX: onSegment id' + id, {id, user, buffer, sampleNumber, last});
    user.appendBuffer(buffer);
   };

   info.tracks.forEach((track, i) => {
    //console.log('MP4BOX: track ' + i, track);
    let mime = '';
    if (track.type === 'video') {
     mime = 'video/mp4; codecs="' + track.codec + '"';
    } else if (track.type === 'audio') {
     mime = 'audio/mp4; codecs="' + track.codec + '"';
    }
    //console.log('MP4BOX: track ' + i, 'mime', mime);

    const sourceBuffer = mediaSource.addSourceBuffer(mime);
    sourceBuffer.mode = 'segments';

    mp4boxfile.setSegmentOptions(track.id, sourceBuffer, {
     //nbSamples: info.tracks[0].nb_samples,
    });
   });

   const initSegs = mp4boxfile.initializeSegmentation();
   //console.log('MP4BOX: initSegs', initSegs);
   initSegs.forEach(seg => {
    const sb = seg.user as SourceBuffer;
    //console.log('MP4BOX: appending to sb with id' + seg.id, seg);
    sb.appendBuffer(seg.buffer);
   });

   mp4boxfile.start();
  };
 }

 async loadChunk(offset: number) {
  const { chunkSize, totalSize } = this.fileInfo;
  const mediaSource = this.mediaSource as MediaSource;
  if (offset >= totalSize) {
   mediaSource.endOfStream();
  }

  try {
   const { chunk } = await this.getFileChunk({ offsetBytes: offset, chunkSize });
   //console.log('Received chunk', chunk);

   // srcTest = URL.createObjectURL(new Blob([chunk.data], { type: 'video/webm' }));
   if (this.mp4boxfile) {
    // @ts-ignore
    chunk.data.buffer.fileStart = offset;
    this.nextBufferStart = this.mp4boxfile.appendBuffer(chunk.data.buffer);
    this.loadChunk(this.nextBufferStart);
   } else {
    this.appendChunk(chunk.data, offset);
   }
  } catch (error) {
   //console.error('Error loading chunk:', error);
  }
 }

 appendChunk(chunk, offset) {
  const { chunkSize, totalSize } = this.fileInfo;
  const sourceBuffer = this.sourceBuffer as SourceBuffer;
  if (!sourceBuffer.updating) {
   sourceBuffer.appendBuffer(chunk);
   sourceBuffer.addEventListener('updateend', () => this.loadChunk(this.nextBufferStart !== undefined ? this.nextBufferStart : offset + chunkSize), { once: true });
  } else {
   sourceBuffer.addEventListener('updateend', () => this.appendChunk(chunk, offset), { once: true });
  }
 }
}

export default MediaHandler;
