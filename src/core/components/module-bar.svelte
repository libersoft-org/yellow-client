<script>
 import { active_account, order, getModuleDecls } from '../core.js';
 import { get } from 'svelte/store';
 import Item from './module-bar-item.svelte';
 export let onSelectModule;
 let module_data;
 let lastModuleSelected = false;

 $: module_data = $active_account?.module_data || {};
 //$: console.log('module-bar module_data:', module_data);
 $: module_data_ordered = order(module_data);
 $: console.log('module-bar module_data_ordered:', module_data_ordered);
 $: selectLastModule(module_data);

 function selectLastModule(module_data) {
  if (!lastModuleSelected && module_data_ordered && module_data_ordered.length > 0) {
   console.log('selectLastModule: lastModuleSelected: ', lastModuleSelected);
   lastModuleSelected = true;
   let acc = get(active_account);
   console.log('selectLastModule: acc: ', acc);
   let id = acc.settings?.last_module_id;
   console.log('selectLastModule: ', module_data);
   console.log('selectLastModule: id: ', id);
   if (module_data[id]) onSelectModule(id);
  }
 }

 function clickSetModule(id) {
  console.log('clickSetModule: ' + id);
  onSelectModule(id);
 }
</script>

<style>
 .module-bar {
  display: flex;
  border-bottom: 1px solid #555;
  background-color: #222;
 }

 .items {
  display: flex;
  padding: 5px;
 }
</style>

<div class="module-bar">
 <div class="items">
  {#each order(getModuleDecls()) as decl (decl.id)}
   <Item img="{decl.id}.svg" alt={decl.name} on:click={() => clickSetModule(decl.id)} />
  {/each}
 </div>
</div>
