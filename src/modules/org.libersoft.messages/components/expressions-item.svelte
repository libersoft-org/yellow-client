<script>
 import BaseButton from '../../../core/components/base-button.svelte';
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
  height: 100%;
  flex: 1;
  text-align: center;
 }

 .item.active {
  color: #000;
  font-weight: bold;
  background-color: #db0;
 }
</style>

{#if label}
 <BaseButton {onClick} {onMousedown}>
  <div class="item {active ? 'active' : ''}">{label}</div>
 </BaseButton>
{/if}
