<script>
 import Button from '../../../core/components/button.svelte';
 import Switch from '../../../core/components/switch.svelte';
 import { render_emojis_as_static, render_emojis_as_raster } from '../emojis.js';
 import { onMount } from "svelte";

 let animate = !$render_emojis_as_static;
 $: (animate !== undefined) && render_emojis_as_static.set(!animate);

 let showAsVector = !$render_emojis_as_raster;
 $: (showAsVector !== undefined) && render_emojis_as_raster.set(!showAsVector);

 onMount(() => {
  console.log('emojis-settings.svelte: onMount');
  console.log('render_emojis_as_static:', $render_emojis_as_static);
  console.log('render_emojis_as_raster:', $render_emojis_as_raster);
  animate = !($render_emojis_as_static);
  showAsVector = !($render_emojis_as_raster);
 });


 function clickUpdate() {}
</script>

<style>
 .settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 10px;
 }

 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .group .label {
  font-weight: bold;
 }
</style>

<div class="settings">
 <div class="group">
  <div class="label">Animate emojis:</div>
  <Switch bind:checked={animate} />
 </div>
 <div class="group">
  <div class="label">Show emojis as vector:</div>
  <Switch bind:checked={showAsVector} />
 </div>
 <Button text="Save & update" onClick={clickUpdate} />
</div>
