<script>
 import BaseButton from './base-button.svelte';
 export let active = false;
 export let onClick;
</script>

<style>
 .corner {
  background-color: #aaa;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
 }

 .corner:hover {
  background-color: #888;
 }

 .corner.active {
  background-color: #da0;
  cursor: default;
 }
</style>

<BaseButton {onClick}>
 <div class="corner {active && 'active'}"></div>
</BaseButton>
