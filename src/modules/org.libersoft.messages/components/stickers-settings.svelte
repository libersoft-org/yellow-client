<script>
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 import Switch from '../../../core/components/switch.svelte';
 export let stickerServer;
 let animateAll = false;

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
<div class="group">
 <div class="label">Animate all stickers:</div>
 <Switch bind:checked={animateAll} />
</div>
<Button text="Save & update" onClick={clickUpdate} />
