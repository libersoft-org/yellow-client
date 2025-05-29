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
  background-color: var(--color-secondary-soft-background);
 }

 .item.odd {
  background-color: var(--color-primary-lighter-background);
 }

 .item:hover {
  background-color: var(--color-primary-background);
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
