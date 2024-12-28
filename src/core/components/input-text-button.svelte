<script>
 import BaseButton from './base-button.svelte';
 export let img;
 export let alt = '';
 export let value;
 export let placeholder;
 export let onClick;
</script>

<style>
 .input-button {
  display: flex;
  align-items: center;
  border: 1px solid #888;
  border-radius: 10px;
  padding: 5px;
 }

 input {
  width: 100%;
  border: 0;
  font-family: inherit;
  font-size: inherit;
 }

 .image {
  padding: 5px;
 }

 .image img {
  display: flex;
  width: 20px;
  height: 20px;
 }
</style>

<div class="input-button">
 <input type="text" bind:value {placeholder} />
 <BaseButton {onClick}>
  <div class="image">
   <img src={img} {alt} />
  </div>
 </BaseButton>
</div>
