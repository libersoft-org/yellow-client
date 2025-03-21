import { InvalidFileReaderResult } from './Media.errors.ts';

class MediaUtils {
 static extractThumbnail(fileChunk) {
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
}

export default MediaUtils;
