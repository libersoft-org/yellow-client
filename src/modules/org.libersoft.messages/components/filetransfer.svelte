<script>
 import ProgressBar from './progressbar.svelte';
 export let file = '';
 export let total = 0;
 export let uploaded = 0;
 export let download = false;

 function humanSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
 }
</script>

<style>
 .upload {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 .text {
  display: flex;
 }

 .text .size {
  flex-grow: 1;
 }
</style>

<div class="upload">
 <div class="file">
  <span class="bold">{download ? 'Downloading' : 'Uploading'}:</span>
  <span>{file}</span>
 </div>
 <ProgressBar color="#db0" moving={true} value={50} />
 <div class="text">
  <div class="size">{humanSize(uploaded)} / {humanSize(total)}</div>
  <div class="percent">50%</div>
 </div>
</div>
