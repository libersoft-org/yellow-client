import videoJS from 'video.js';
import 'video.js/dist/video-js.css';
import mp4box, { type MP4File } from '@webav/mp4box.js';


class MediaHandler {
 videoElement: HTMLVideoElement;
 _getFileChunk: (args: { offsetBytes: number; chunkSize: number }) => Promise<{ chunk: { data: Uint8Array } }>;

 mediaSource: MediaSource | null;
 sourceBuffer: SourceBuffer | null;
 player: ReturnType<typeof videoJS> | null;
 mp4boxfile: MP4File | null;
 nextBufferStart?: number;
 nextBufferStartSeeked: boolean = false;

 fileInfo: {
  id: string;
  fileMime: string;
  chunkSize: number;
  totalSize: number;
 };

 cache = new Map<number, Uint8Array>();

 constructor(videoElement: HTMLVideoElement, getFileChunk: MediaHandler['_getFileChunk'], fileInfo: MediaHandler['fileInfo']) {
  this.videoElement = videoElement;
  this._getFileChunk = getFileChunk;

  this.sourceBuffer = null;
  this.mediaSource = null;
  this.fileInfo = fileInfo;
  this.player = null;
  this.mp4boxfile = null;
 }

 async getOrLoadChunk(args: {offsetBytes: number, chunkSize: number}) {
  const {offsetBytes, chunkSize} = args
  if (this.cache.has(offsetBytes) && false) {
   return this.cache.get(offsetBytes);
  } else {
   const {chunk} = await this._getFileChunk({offsetBytes, chunkSize});
   this.cache.set(offsetBytes, chunk.data);
   return chunk.data;
  }
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
  }

  player.ready(() => {
   this.mediaSource = new MediaSource();
   videoElement.src = URL.createObjectURL(this.mediaSource);
   const mediaSource = this.mediaSource as MediaSource;

   mediaSource.addEventListener('sourceopen', () => {
    console.log('sourceopen');
    let mime = '';
    if (this.fileInfo.fileMime === 'video/mp4') {
     this.setupMP4Box();
     return;
    } else if (this.fileInfo.fileMime === 'video/webm') {
     mime = 'video/webm; codecs="vp8, vorbis"';
    }

    console.log('mime', mime);

    if (mime) {
     //console.info('Media Handler: mime type picked:', mime);
     this.sourceBuffer = mediaSource.addSourceBuffer(mime);
     //this.sourceBuffer.mode = 'segments'
    } else {
     console.error('Unsupported mime type' + this.fileInfo.fileMime)
    }
   });
  });

  player.on('play', async (...args) => {
   console.log('play', args);
   console.log('play duration', player.duration());
   console.log('play currentTime', player.currentTime());

   const currentTime = player.currentTime()
   const duration = player.duration()

   if (currentTime === 0) {
    this.loadChunk(0);
   } else {
    if (!duration || !currentTime) {
     console.warn('Cannot seek yet');
     return
    }
    const bitRate = this.fileInfo.totalSize / duration;
    const estimatedOffset = currentTime * bitRate;
    const newOffset = estimatedOffset - (estimatedOffset % this.fileInfo.chunkSize)
    console.log('seeked bitRate', bitRate);
    console.log('seeked estimatedOffset', estimatedOffset);
    console.log('seeked newOffset', newOffset);
    if (this.mp4boxfile) {
     // todo
     const specialTime = Math.max(Math.floor(currentTime - 2), 0)
     console.log('MP4BOX seek specialTime:', specialTime);
     const seek = this.mp4boxfile.seek(specialTime)
     console.log('MP4BOX seek:', seek);
     this.nextBufferStart = seek.offset
     this.nextBufferStartSeeked = true
     // this.loadChunk(seek.offset)
    } else {
     console.log('loading new newOffset');
     if (this.mediaSource.readyState === "open") {
      // this.sourceBuffer.abort();
      console.log('this.sourceBuffer', this.sourceBuffer);
      //this.sourceBuffer.remove(0, this.mediaSource.duration); // Clear old buffer
      //this.sourceBuffer.abort()
      console.log('this.sourceBuffer.updating', this.sourceBuffer.updating);
      console.log('this.sourceBuffer', this.sourceBuffer);
     }
     console.log('wait for it');
     setTimeout(() => {

      //this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8, vorbis"');
      console.log('this.sourceBuffer.updating', this.sourceBuffer.updating);
      console.log('this.sourceBuffer', this.sourceBuffer);
      this.loadChunk(newOffset)
     }, 1000)
    }
   }
  });

  //player.on('seeked', (...args) => {
  // console.log('seeked', args);
  // console.log('seeked time', player.currentTime());
//
  // const newTime = player.currentTime()
  // const duration = player.duration()
//
  // console.log('seeked newTime', newTime);
  // console.log('seeked duration', duration);
//
  // if (!duration || !newTime) {
  //  console.warn('Cannot seek yet');
  //  return
  // }
//
  // const bitRate = this.fileInfo.totalSize / duration;
  // const estimatedOffset = newTime * bitRate;
  // const newOffset = estimatedOffset - (estimatedOffset % this.fileInfo.chunkSize)
  // console.log('seeked bitRate', bitRate);
  // console.log('seeked estimatedOffset', estimatedOffset);
  // console.log('seeked newOffset', newOffset);
//
  // if (this.mp4boxfile) {
  //  // todo
  // } else {
  //  console.log('loading new newOffset');
  //  // if (this.mediaSource.readyState === "open") {
  //  //  this.sourceBuffer.abort();
  //  //  this.sourceBuffer.remove(0, this.mediaSource.duration); // Clear old buffer
  //  // }
  //  //this.loadChunk(newOffset)
  // }
  //});

  return this.player;
 }

 async setupMP4Box() {
  const mp4boxfile = mp4box.createFile();
  this.mp4boxfile = mp4boxfile;

  console.info('MP4BOX: started');

  mp4boxfile.onError = function (e) {
   console.info('MP4BOX: error', e);
  };

  mp4boxfile.onReady = async info => {
   console.info('MP4BOX: onReady INFO', info);
   const mediaSource = this.mediaSource as MediaSource;
   mediaSource.duration = info.duration / info.timescale;

   mp4boxfile.onSegment = (id, user, buffer, sampleNumber, last) => {
    console.info('MP4BOX: onSegment id' + id, {id, user, buffer, sampleNumber, last});
    //user.appendBuffer(buffer);

    const apnd = () => {
     user.appendBuffer(buffer);
     //this.loadChunk(this.nextBufferStart as number);
    }

    if (user.updating) {
     user.addEventListener('updateend', () => apnd(), { once: true });
    } else {
     apnd()
    }
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

 async loadChunk(offsetBytes: number) {
  const { chunkSize, totalSize } = this.fileInfo;
  const mediaSource = this.mediaSource as MediaSource;
  if (offsetBytes >= totalSize) {
   // todo check
   //mediaSource.endOfStream();
  }
  console.log('loadChunk offsetBytes', offsetBytes);
  try {
   const data = await this.getOrLoadChunk({ offsetBytes, chunkSize }) as Uint8Array;
   console.log('Received chunk data', data);

   // srcTest = URL.createObjectURL(new Blob([data], { type: 'video/webm' }));
   if (this.mp4boxfile) {
    // @ts-ignore
    data.buffer.fileStart = offsetBytes;
    const newBufferStart = this.mp4boxfile.appendBuffer(data.buffer);
    if (this.nextBufferStartSeeked) {
     this.nextBufferStartSeeked = false
    } else {
     this.nextBufferStart = newBufferStart
    }
    this.loadChunk(this.nextBufferStart as number);
   } else {
    this.appendChunk(data, offsetBytes)
   }
  } catch (error) {
   console.error('Error loading chunk:', error);
  }
 }

 appendChunk(chunk, offset) {
  const { chunkSize, totalSize } = this.fileInfo;
  const sourceBuffer = this.sourceBuffer as SourceBuffer;
  if (!sourceBuffer.updating) {
   sourceBuffer.appendBuffer(chunk);
   console.log('this.nextBufferStart', this.nextBufferStart);

   if (offset + chunkSize < totalSize) {
    sourceBuffer.addEventListener('updateend', () => this.loadChunk(offset + chunkSize), { once: true });
   }
  } else {
   sourceBuffer.addEventListener('updateend', () => this.appendChunk(chunk, offset), { once: true });
  }
 }
}

export default MediaHandler;
