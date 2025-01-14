<script>
 import BaseButton from './base-button.svelte';
 export let img;
 export let label;
 export let active;
 export let onClick;
</script>

<style>
 .item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1; /* TODO: this is not working as it needs to be applied on BaseButton, not on .item. If applied to BaseButton, it spoils everything that doesn't need it.*/
  padding: 10px;
  color: #fff;
 }

 .item.active {
  font-weight: bold;
  background-color: #444;
 }

 .item:hover {
  background-color: #333;
 }

 .item img {
  display: flex;
  width: 20px;
  height: 20px;
 }
</style>

<BaseButton {onClick}>
 <div class="item {active ? 'active' : ''}">
  {#if img}
   <div><img src={img} alt={label ? label : ''} /></div>
  {/if}
  {#if label}
   <div>{label}</div>
  {/if}
 </div>
</BaseButton>
