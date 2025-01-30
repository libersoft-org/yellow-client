<script>
 import { humanSize } from '../../../core/utils/file.utils.js';
 import Button from '../../../core/components/button.svelte';
 let chunkSize = 64 * 1024;

 function clickSetChunkSize() {}
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
  <span class="bold">Chunk size:</span>
  <span>{humanSize(chunkSize)}</span>
 </div>
 <input class="zoom" type="range" min="1024" max="52428800" step="1024" bind:value={chunkSize} />
</div>
<Button text="Apply" onClick={clickSetChunkSize} />
