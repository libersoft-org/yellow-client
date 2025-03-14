import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/plugins/record';

class MediaRecorderHandler {
 mediaRecorder: MediaRecorder | null = null;
 audioChunks: Blob[] = [];

 wavesurfer: WaveSurfer | null = null;

 create(element: HTMLElement) {
  if (this.wavesurfer) {
   this.wavesurfer.destroy();
  }

  // Create a new Wavesurfer instance
  this.wavesurfer = WaveSurfer.create({
   container: element,
   waveColor: 'rgb(255 221 17)',
   progressColor: 'rgb(167,145,8)',
   height: 32,
   fillParent: true,
   hideScrollbar: true,
   autoScroll: true,
   autoCenter: true,
  });
  const wavesurfer = this.wavesurfer as WaveSurfer;

  const record = wavesurfer.registerPlugin(
   RecordPlugin.create({
    renderRecordedAudio: false,
    scrollingWaveform: true,
    continuousWaveform: false,
    //continuousWaveformDuration: 30, // optional
    scrollingWaveformWindow: 4,
   })
  );

  return record;
 }

 async startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  this.mediaRecorder = new MediaRecorder(stream);
  const mediaRecorder = this.mediaRecorder as MediaRecorder;

  mediaRecorder.ondataavailable = event => {
   // console.log('pushing chunk', event.data);
   this.audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
   const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
   // const audioUrl = URL.createObjectURL(audioBlob);
   // console.log('audioBlob', audioBlob);
  };

  mediaRecorder.start();
 }

 stopRecording() {
  const mediaRecorder = this.mediaRecorder as MediaRecorder;
  mediaRecorder.stop();
 }
}

export default MediaRecorderHandler;
