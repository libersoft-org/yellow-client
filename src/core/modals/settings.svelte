<script>
 import Switch from '../components/switch.svelte';
 import { notificationsEnabled } from '../core.js';
 let zoom = 100;

 function setZoom() {
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
 <input class="zoom" type="range" min="30" max="300" step="1" bind:value={zoom} on:change={setZoom} />
</div>
<div class="group">
 <div class="label">
  <span class="bold">Notifications:</span>
 </div>
 <Switch bind:checked={$notificationsEnabled} />
</div>
