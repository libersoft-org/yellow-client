<script>
 import ProgressBar from './progressbar.svelte';
 import { humanSize } from "../../../core/utils/file.utils.js";
 export let file = '';
 export let total = 0;
 export let uploaded = 0;
 export let download = false;

 $: percent = total > 0 ? Math.round((uploaded / total) * 100) : 0;
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
   <span class="bold">{download ? 'Downloading' : 'Uploading'} </span>
   {#if file}
    <span>{file}</span>
   {/if}
  </div>
 <ProgressBar color="#db0" moving={true} value={percent} />
 <div class="text">
  <div class="size">{humanSize(uploaded)} / {humanSize(total)}</div>
  <div class="percent">{percent}%</div>
 </div>
</div>
