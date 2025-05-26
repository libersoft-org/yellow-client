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
 }

 .item img {
  width: 32px;
  height: 32px;
 }

 .item.even {
  background-color: var(--color-primary-light);
 }

 .item.odd {
  background-color: var(--color-primary-lighter);
 }

 .item:hover {
  background-color: var(--color-primary);
 }
</style>

<BaseButton {onClick}>
 <div class="item {className}">
  {#if icon}
   <div><img src={icon} alt={item} /></div>
  {/if}
  <div>{item}</div>
 </div>
</BaseButton>
