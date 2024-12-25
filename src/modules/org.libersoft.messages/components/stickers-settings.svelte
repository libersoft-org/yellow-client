<script>
 import Button from '../../../core/components/button.svelte';
 export let stickerServer;

 function clickUpdate() {}
</script>

<style>
 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .group .label {
  font-weight: bold;
 }

 .group input {
  width: 10px;
  padding: 10px;
  border: 1px solid #000;
  flex-grow: 1;
  border-radius: 10px;
 }
</style>

<div class="group">
 <div class="label">Sticker server:</div>
 <input type="text" bind:value={stickerServer} />
</div>
<Button text="Save & update" on:click={clickUpdate} />
