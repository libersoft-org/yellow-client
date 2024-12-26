<script>
 import { active_account, order, getModuleDecls } from '../core.js';
 import { get } from 'svelte/store';
 import BaseButton from './base-button.svelte';
 import Icon from './icon.svelte';
 export let onSelectModule;
 let module_data;
 let lastModuleSelected = false;
 let expanded = false;

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
   console.log('selectLastModule: ', module_data);
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
  {#each order(getModuleDecls()) as decl (decl.id)}
   <Icon img="img/modules/{decl.id}.svg" alt={decl.name} size="30" onClick={() => clickSetModule(decl.id)} />
  {/each}
 </div>
 <BaseButton onClick={clickExpand}>
  <div class="dropdown">
   <img src={expanded ? 'img/up.svg' : 'img/down.svg'} alt={expanded ? '▲' : '▼'} />
  </div>
 </BaseButton>
</div>
