<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let icon;
 export let label;
 export let active;
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
 }

 .item.active {
  color: #000;
  font-weight: bold;
  background-color: #db0;
 }

 .item img {
  height: 24px;
  width: 24px;
 }

 .item .label {
  font-size: 14px;
 }
</style>

<BaseButton {onClick} {onMousedown}>
 <div class="item {active ? 'active' : ''}">
  {#if icon}
   <img src={icon} alt={label} />
  {/if}
  {#if label}
   <div class="label">{label}</div>
  {/if}
 </div>
</BaseButton>
