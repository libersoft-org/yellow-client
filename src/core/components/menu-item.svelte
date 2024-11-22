<script>
 import { createEventDispatcher } from 'svelte';
 export let img;
 export let title;
 const dispatch = createEventDispatcher();

 function handleKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

<style>
 .item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #444;
 }

 .item:hover {
  background-color: #333;
 }

 .item img {
  width: 24px;
  height: 24px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click on:keydown={handleKey}>
 <img src={img} alt={title} />
 <div>{title}</div>
</div>
