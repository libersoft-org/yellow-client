<script>
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 import Switch from '../../../core/components/switch.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import { sticker_server, sticker_servers } from '../stickers.js';
 import { expressions_renderer, animate_all_expressions } from '../expressions.svelte.ts';
 import Button from '../../../core/components/button.svelte';
 import ModalStickerServers from './modal-sticker-servers.svelte';

 let isModalStickerServersOpen = false;
 let showAsVector = $expressions_renderer === 'svg';
 let animateAll = $animate_all_expressions;
 $: showAsVector !== undefined && expressions_renderer.set(showAsVector ? 'svg' : 'canvas');
 $: animateAll !== undefined && animate_all_expressions.set(animateAll);

 function clickManageStickerServers() {
  console.log('Click: Manage sticker servers');
  isModalStickerServersOpen = !isModalStickerServersOpen;
 }
</script>

<style>
 .settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .group .label {
  font-size: 14px;
  flex-grow: 1;
 }
</style>

<div class="settings">
 <div class="group">
  <div class="label">Show expressions as vector (slower, nicer):</div>
  <Switch bind:checked={showAsVector} />
 </div>
 <div class="group">
  <div class="label">Animate all expressions:</div>
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
</div>
<Modal title="Manage sticker servers" body={ModalStickerServers} bind:show={isModalStickerServersOpen} />
