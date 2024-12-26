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
  flex: 1;
  text-align: center;
  cursor: pointer;
  padding: 10px 0;
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
