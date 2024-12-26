<script>
 import BaseButton from './base-button.svelte';
 export let img;
 export let title;
 export let onClick;
</script>

<style>
 .item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
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

<BaseButton {onClick}>
 <div class="item">
  <img src={img} alt={title} />
  <div>{title}</div>
 </div>
</BaseButton>
