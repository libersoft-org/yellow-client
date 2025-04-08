import { type MediaFileInfo, MediaLoader } from './types.ts';
import mediaInfoFactory from 'mediainfo.js';

class BasicLoader extends MediaLoader {
 sourceBuffer: SourceBuffer | null = null;
 buffer: Uint8Array[] = [];

 async setup() {
  const mime = this.mediaFileInfo.fileMime;
  this.sourceBuffer = this.mediaSource.addSourceBuffer(mime);
 }

 processChunk: MediaLoader['processChunk'] = chunk => {
  const sourceBuffer = this.sourceBuffer as SourceBuffer;

  // download whole video
  // const fileSize = this.mediaFileInfo.totalSize;
  // const { offset, chunkSize, data } = chunk;
  // const byteOffset = offset * chunkSize;
  // const byteLength = data.byteLength;
  // const chunks: Uint8Array[] = [];
  //
  // for (let offsetToFetch = offset; offsetToFetch < fileSize; offsetToFetch += chunkSize) {
  //  await this.getFileChunk({ offsetBytes: offset, chunkSize })
  // }
  const { offset, chunkSize, data } = chunk;
  console.log('!!! processChunk', chunk);
  this.buffer.push(data);
  const nextOffset = offset + chunkSize
  console.log('nextOffset', nextOffset);

  if (nextOffset > this.mediaFileInfo.totalSize) {
   console.warn('!!! end of file');
   this.sourceBuffer?.appendBuffer(new Uint8Array(this.buffer.flat()));
  }
  return nextOffset;
 };
}

export default BasicLoader;
