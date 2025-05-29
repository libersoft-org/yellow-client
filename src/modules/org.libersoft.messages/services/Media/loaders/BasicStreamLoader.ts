import { MediaLoader } from './types.ts';
import mediaInfoFactory from 'mediainfo.js';

class BasicStreamLoader extends MediaLoader {
  sourceBuffer: SourceBuffer | null = null;

  async setup() {
    const mediainfo = await mediaInfoFactory({
      format: 'object',
    });
    const fileSize = 1024 * 64;
    // console.log('SETUP: mediainfo', mediainfo);

    const readChunk = async (chunkSize, offset) => {
      // console.log('SETUP: readChunk', {chunkSize, offset});
      const { chunk } = await this.getFileChunk({ offsetBytes: offset, chunkSize });
      return new Uint8Array(chunk.data);
    };

    const result = await mediainfo.analyzeData(fileSize, readChunk);
    // console.log('SETUP: result', result);
    mediainfo.close();

    const tracks = result.media?.track;

    if (!tracks) {
      throw new Error('No tracks found');
    }

    // const videoTrack = tracks.find(track => track['@type'] === 'Video');
    // const audioTrack = tracks.find(track => track['@type'] === 'Audio');
    // console.log('SETUP: videoTrack', videoTrack);
    // console.log('SETUP: audioTrack', audioTrack);

    const mime = this.mediaFileInfo.fileMime;

    // console.log('SETUP: mime', mime);
    this.sourceBuffer = this.mediaSource.addSourceBuffer(mime);
    // console.log('SETUP: sourceBuffer', this.sourceBuffer);
  }

  processChunk: MediaLoader['processChunk'] = (chunk) => {
    const sourceBuffer = this.sourceBuffer as SourceBuffer;

    const append = () => {
      sourceBuffer.appendBuffer(chunk.data);
    };
    if (!sourceBuffer.updating) {
      append();
    } else {
      sourceBuffer.addEventListener('updateend', () => append(), { once: true });
    }

    return chunk.offset + chunk.chunkSize;
  };
}

export default BasicStreamLoader;
