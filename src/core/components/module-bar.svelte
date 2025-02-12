<script>
 import { active_account, order, module_decls } from '../core.js';
 import { get } from 'svelte/store';
 import BaseButton from './base-button.svelte';
 import ModuleBarItem from './module-bar-item.svelte';

 export let onSelectModule;
 let module_data;
 let lastModuleSelected = false;
 let expanded = false;
 let module_decls_ordered = [];

 $: module_decls_ordered = order($module_decls);

 $: module_data = $active_account?.module_data || {};
 //$: console.log('module-bar module_data:', module_data);
 $: module_data_ordered = order(module_data);
 //$: console.log('module-bar module_data_ordered:', module_data_ordered);
 $: selectLastModule(module_data);

 function selectLastModule(module_data) {
  //console.log('selectLastModule: lastModuleSelected: ', module_data);
  if (!lastModuleSelected && module_data_ordered && module_data_ordered.length > 0) {
   //console.log('selectLastModule: lastModuleSelected: ', lastModuleSelected);
   lastModuleSelected = true;
   let acc = get(active_account);
   //console.log('selectLastModule: acc: ', acc);
   let id = acc.settings?.last_module_id;
   //console.log('selectLastModule: ', module_data);
   //console.log('selectLastModule: id: ', id);
   if (module_data[id]) onSelectModule(id);
  }
 }

 function clickSetModule(id) {
  console.log('clickSetModule: ' + id);
  onSelectModule(id);
 }

 function clickExpand() {
  expanded = !expanded;
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
  flex-direction: row;
  justify-content: center;
  flex-grow: 1;
  padding: 5px;
  overflow: hidden;
  flex-wrap: wrap;
  height: 40px;
 }

 .items.expanded {
  overflow: visible;
  height: auto;
 }

 .dropdown {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 10px;
 }

 .dropdown img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="module-bar">
 <div class="items {expanded ? 'expanded' : ''}">
  {#each module_decls_ordered as decl (decl.id)}
   <ModuleBarItem online={$active_account?.module_data[decl.id]?.online} {decl} {clickSetModule} />
  {/each}
 </div>
 <BaseButton onClick={clickExpand}>
  <div class="dropdown">
   <img src={expanded ? 'img/up.svg' : 'img/down.svg'} alt={expanded ? '▲' : '▼'} />
  </div>
 </BaseButton>
</div>
