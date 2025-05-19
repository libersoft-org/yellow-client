<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 export let img;
 export let label;
 export let active;
 export let colorVariable = '--icon-white';
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
</style>

<BaseButton {onClick}>
 <div class="item {active ? 'active' : ''}">
  {#if img}
   <Icon {img} alt={label ? label : ''} {colorVariable} size="20px" padding="0px" />
  {/if}
  {#if label}
   <div>{label}</div>
  {/if}
 </div>
</BaseButton>
