<script>
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 import Switch from '../../../core/components/switch.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import { render_stickers_as_raster, sticker_server, sticker_servers, animate_all_stickers } from '../stickers.js';
 import Button from '../../../core/components/button.svelte';
 import ModalStickerServers from './modal-sticker-servers.svelte';

 let showAsVector = !$render_stickers_as_raster;
 let isModalStickerServersOpen = false;
 let animateAll = $animate_all_stickers;
 $: showAsVector !== undefined && render_stickers_as_raster.set(!showAsVector);
 $: animateAll !== undefined && animate_all_stickers.set(animateAll);

 function clickManageStickerServers() {
  console.log('Click: Manage sticker servers');
  isModalStickerServersOpen = !isModalStickerServersOpen;
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
 <div class="label">Animate all stickers in sets:</div>
 <Switch bind:checked={animateAll} />
</div>
<div class="group">
 <div class="label">Sticker server:</div>
 <Select bind:value={$sticker_server}>
  {#each $sticker_servers as server}
   <Option value={server} text={server} />
  {/each}
 </Select>
</div>
<Button text="Manage sticker servers" onClick={clickManageStickerServers} />
<Modal title="Manage sticker servers" body={ModalStickerServers} bind:show={isModalStickerServersOpen} />
