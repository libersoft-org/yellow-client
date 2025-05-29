<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 export let icon;
 export let label;
 export let active;
 export let colorVariable = '--icon-black';
 export let onClick;

 function onMousedown(e) {
  e.stopPropagation();
  e.preventDefault();
 }
</script>

<style>
 .item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 100%;
  flex: 1;
  text-align: center;
  padding: 0 10px;
 }

 .item.active {
  color: var(--color-primary-foreground);
  font-weight: bold;
  background-color: #db0;
 }

 .item .label {
  font-size: 14px;
 }
</style>

<BaseButton {onClick} {onMousedown} height="100%">
 <div class="item {active ? 'active' : ''}">
  {#if icon}
   <Icon img={icon} alt={label} {colorVariable} size="24px" padding="0px" />
  {/if}
  {#if label}
   <div class="label">{label}</div>
  {/if}
 </div>
</BaseButton>
