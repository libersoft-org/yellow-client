<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 export let item = '';
 export let icon = '';
 export let className = '';
 export let onClick;
</script>

<style>
 .item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  width: 100%;
 }

 .item img {
  width: 32px;
  height: 32px;
 }

 .item.even {
  background-color: #ffa;
 }

 .item.odd {
  background-color: #ffd;
 }

 .item:hover {
  background-color: #fd1;
 }
</style>

<BaseButton {onClick} width="100%">
 <div class="item {className}">
  {#if icon}
   <div><img src={icon} alt={item} /></div>
  {/if}
  <div>{item}</div>
 </div>
</BaseButton>
