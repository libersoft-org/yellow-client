<script>
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
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
</style>

<div class="group">
 <div class="label">Sticker server:</div>
 <InputText bind:value={stickerServer} />
</div>
<Button text="Save & update" onClick={clickUpdate} />
