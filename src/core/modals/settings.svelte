<script>
 import { getContext } from 'svelte';
 import Button from '../components/button.svelte';
 let zoom = 100;

 function clickSetZoom() {
  document.body.style.transform = 'scale(' + zoom / 100 + ')';
  document.body.style.transformOrigin = '0 0';
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
  <span class="bold">Zoom:</span>
  <span>{zoom}%</span>
 </div>
 <input class="zoom" type="range" min="30" max="300" step="1" bind:value={zoom} />
</div>
<Button text="Apply" onClick={clickSetZoom} />
