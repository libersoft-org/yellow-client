<script>
 import BaseButton from './base-button.svelte';
 export let img;
 export let title = '';
 export let onClick;
</script>

<style>
 .accounts-button {
  display: flex;
  gap: 10px;
  padding: 10px;
 }

 .accounts-button img {
  width: 20px;
  height: 20px;
 }

 .accounts-button:hover {
  background-color: #222;
 }
</style>

<BaseButton {onClick}>
 <div class="accounts-button">
  {#if img}
   <div><img src={img} alt={title} /></div>
  {/if}
  <div>{title}</div>
 </div>
</BaseButton>
