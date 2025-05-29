import { InvalidFileReaderResult } from './errors.ts';
import _debug from 'debug';

const debug = _debug('libersoft:messages:services:MediaUtils');

class MediaUtils {
  static PROGRESSIVE_DOWNLOAD_MEDIA_ENDPOINT = '/yellow/media';
  static makeProgressiveDownloadUrl = (localAccountId: string, uploadId: string) => {
    return `${MediaUtils.PROGRESSIVE_DOWNLOAD_MEDIA_ENDPOINT}/${localAccountId}/${uploadId}`;
  };

  static extractThumbnail(fileChunk: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(fileChunk);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      const drawFrame = () => {
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;

        const maxWidth = 600;
        const maxHeight = 400;

        let width = originalWidth;
        let height = originalHeight;

        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio, 1);

        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob((blob) => {
          cleanup();
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail blob'));
          }
        }, 'image/png');
      };

      video.addEventListener('error', (err) => {
        console.error('thumbnail: Error extracting thumbnail', err);
        cleanup();
        reject(err);
      });

      video.addEventListener(
        'loadedmetadata',
        () => {
          if (video.readyState >= 2) {
            video.currentTime = 0.1;
            video.addEventListener('seeked', drawFrame, { once: true });
          } else {
            video.addEventListener('loadeddata', drawFrame, { once: true });
          }
        },
        { once: true }
      );

      video.load();
    });
  }

  static getAudioDataFromFile(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        if (!(reader.result instanceof ArrayBuffer)) {
          reject(new InvalidFileReaderResult());
          return;
        }

        const { duration, peaks } = await MediaUtils.getAudioDataFromArrayBuffer(reader.result);
        resolve({ duration, peaks });
      };
    });
  }

  static async getAudioDataFromArrayBuffer(arrayBuffer: ArrayBuffer) {
    // @ts-ignore
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    // console.log('audioBuffer', audioBuffer);
    const duration = audioBuffer.duration;

    // set samples based on duration to render wave peaks more precisely
    let samplesPerPeak = 20000;
    if (duration < 30) {
      samplesPerPeak = 1000;
    }
    if (duration < 300) {
      samplesPerPeak = 5000;
    }

    const peaks = MediaUtils.extractPeaks(audioBuffer, samplesPerPeak);

    // console.log("Duration:", duration, "seconds");
    // console.log("Peaks:", peaks);

    return { duration, peaks };
  }

  static extractPeaks(audioBuffer: AudioBuffer, samplesPerPeak = 1000) {
    const channelData = audioBuffer.getChannelData(0); // Use the first channel
    const peaks: number[] = [];
    let max = 0;

    for (let i = 0; i < channelData.length; i++) {
      max = Math.max(max, Math.abs(channelData[i]));
      if (i % samplesPerPeak === 0) {
        peaks.push(max);
        max = 0;
      }
    }
    return peaks;
  }

  static async checkProgressiveDownloadAvailability(url: string) {
    try {
      debug('Trying to check progressive download availability for', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Range: 'bytes=0-1',
        },
      });

      if (response.status === 206) {
        debug('Progressive download available');
        return true;
      } else {
        debug('Progressive download not available', response.status);
        return false;
      }
    } catch (error) {
      debug('Progressive not available', error);
      return false;
    }
  }
}

export default MediaUtils;
