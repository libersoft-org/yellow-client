
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
}

export default MediaUtils
