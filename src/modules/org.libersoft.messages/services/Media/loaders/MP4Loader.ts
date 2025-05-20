import mp4box, { type MP4ArrayBuffer, type MP4File } from '@webav/mp4box.js';
import { MediaLoader } from './types.ts';

class MP4Loader extends MediaLoader {
 mp4boxFile: MP4File | null = null;

 async setup() {
  const mp4boxFile = mp4box.createFile();
  this.mp4boxFile = mp4boxFile;

  mp4boxFile.onError = function (e) {
   console.error('MP4BOX: error', e);
  };

  mp4boxFile.onReady = async info => {
   // console.info('MP4BOX: onReady INFO', info);
   const mediaSource = this.mediaSource as MediaSource;
   mediaSource.duration = info.duration / info.timescale;

   // @ts-ignore TODO typing
   mp4boxFile.onSegment = (id, user, buffer, sampleNumber, last) => {
    // console.info('MP4BOX: onSegment id' + id, {id, user, buffer, sampleNumber, last});
    //user.appendBuffer(buffer);

    const append = () => {
     user.appendBuffer(buffer);
     //this.loadChunk(this.nextBufferStart as number);
    };

    if (user.updating) {
     user.addEventListener('updateend', () => append(), { once: true });
    } else {
     append();
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

    // @ts-ignore TODO typing
    mp4boxFile.setSegmentOptions(track.id, sourceBuffer, {
     //nbSamples: info.tracks[0].nb_samples,
    });
   });

   // @ts-ignore TODO typing
   const initSegs = mp4boxFile.initializeSegmentation();
   //console.log('MP4BOX: initSegs', initSegs);
   initSegs.forEach(seg => {
    const sb = seg.user as SourceBuffer;
    //console.log('MP4BOX: appending to sb with id' + seg.id, seg);
    sb.appendBuffer(seg.buffer);
   });

   mp4boxFile.start();
  };
 }

 processChunk: MediaLoader['processChunk'] = chunk => {
  if (!this.mp4boxFile) {
   throw new Error('MP4BOX not initialized');
  }
  const arrayBuffer = chunk.data.buffer as MP4ArrayBuffer;
  arrayBuffer.fileStart = chunk.offset;
  const nextOffset = this.mp4boxFile.appendBuffer(arrayBuffer);
  // console.log('MP4BOX: nextOffset', nextOffset);
  return nextOffset;
 };

 seek = (time: number) => {
  const mp4boxFile = this.mp4boxFile as MP4File;
  const specialTime = Math.max(Math.floor(time - 2), 0);
  // console.log('MP4BOX: seek specialTime:', specialTime);
  const seek = mp4boxFile.seek(specialTime);
  // console.log('MP4BOX: seek:', seek);
  return seek.offset;
 };
}

export default MP4Loader;
