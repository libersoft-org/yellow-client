<script>

 import { active_account } from '../../core/core.js';

 let module_data;
 $: module_data = $active_account.module_data;

 export let onSelectModule;

 function clickSetModule(name) {
  onSelectModule(name);
 }

 function keySetModule(name) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickSetModule(name);
  }
 }
</script>

<style>
 .items {
  display: flex;
  padding: 5px;
  border-bottom: 1px solid #555;
  background-color: #222;
 }

 .items .item {
  display: flex;
  padding: 10px;
  cursor: pointer;
 }

 .items .item img {
  width: 30px;
  height: 30px;
 }
</style>

<div class="items">

 $module_data:{ JSON.stringify(module_data) }


</div>
