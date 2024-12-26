<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let label;
 export let active = false;
 export let onClick;
</script>

<style>
 .section {
  padding: 10px;
  background-color: #ffa;
 }

 .section.active {
  font-weight: bold;
  background-color: #fe6;
 }

 .section:hover {
  background-color: #fd1;
 }
</style>

<BaseButton {onClick}>
 <div class="section {active ? 'active' : ''}">{label}</div>
</BaseButton>
