<script>
 import { humanSize } from '@/core/utils/fileUtils.js';
 import Input from '@/core/components/Input/Input.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import { uploadChunkSize, hideMessageTextInNotifications } from '../messages.js';
 import Switch from '@/core/components/Switch/Switch.svelte';
 export let close;
 let chunkSize = $uploadChunkSize;

 function clickSetChunkSize() {
  uploadChunkSize.set(chunkSize);
  close();
 }
</script>

<style>
 .group {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 input[type='range'] {
  width: 100%;
  max-width: 300px;
 }
</style>

<div class="group">
 <div class="label">
  <span class="bold">File upload chunk size:</span>
  <span>{humanSize(chunkSize)}</span>
 </div>
 <Input type="number" bind:value={chunkSize} />
 <input class="zoom" type="range" min="1024" max="52428800" step="1024" bind:value={chunkSize} />
</div>
<Button text="Save" onClick={clickSetChunkSize} />

<div class="group">
 <div class="label">
  <span class="bold">Privacy</span>
 </div>
 <Switch bind:checked={$hideMessageTextInNotifications} label="Hide message text in notifications" />
</div>
