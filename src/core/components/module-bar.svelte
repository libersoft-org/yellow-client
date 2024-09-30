<script>

 import { active_account, order, selected_module_id } from '../../core/core.js';
 import { get } from "svelte/store";

 let module_data;
 $: module_data = $active_account?.module_data || {}
 $: console.log('module-bar module_data:', module_data);
 $: module_data_ordered = order(module_data);
 $: console.log('module-bar module_data_ordered:', module_data_ordered);

 export let onSelectModule;

 let lastModuleSelected = false;
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
   if (module_data[id]) {
    onSelectModule(id);
   }
  }
 }

 function clickSetModule(id) {
  console.log('clickSetModule: ' + id);
  onSelectModule(id);
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

 .message {
  color: #fff;

 }
</style>

<div class="items">

 {#if module_data_ordered?.length && module_data_ordered.length > 0}

  {#each module_data_ordered as module (module.id)}
   <div class="item" on:click={() => clickSetModule(module.id)} on:keydown={() => keySetModule(module.id)} tabindex="0">
    <img src="img/modules/{module.decl.id}.svg" alt={module.decl.name} />
   </div>
  {/each}

 {:else}
  <div class="message" >({$active_account.status})</div>
 {/if}


</div>
