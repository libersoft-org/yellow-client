<script>
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 import Switch from '../../../core/components/switch.svelte';
 import { render_stickers_as_raster } from '../stickers.js';
 import Button from '../../../core/components/button.svelte';
 export let stickerServer = 'https://stickers.libersoft.org';
 let showAsVector = !$render_stickers_as_raster;

 $: showAsVector !== undefined && render_stickers_as_raster.set(!showAsVector);

 function clickManageStickerServers() {
  console.log('Click: Manage sticker servers');
 }
</script>

<style>
 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .group .label {
  flex-grow: 1;
 }
</style>

<div class="group">
 <div class="label">Show stickers as vector (slower, nicer):</div>
 <Switch bind:checked={showAsVector} />
</div>
<div class="group">
 <div class="label">Sticker server:</div>
 <Select bind:value={stickerServer}>
  <Option value="https://stickers.libersoft.org" text="https://stickers.libersoft.org" />
 </Select>
</div>
<Button text="Manage sticker servers" on:click={clickManageStickerServers} />
