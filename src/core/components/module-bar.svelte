<script>

 import { active_account, order } from '../../core/core.js';

 let module_data;
 $: module_data = $active_account?.module_data || {"nope": "nope"};
 $: console.log('module-bar module_data:', module_data);
 $: module_data_ordered = order(module_data);

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

 {#if module_data_ordered}

  {#each module_data_ordered as module (module.id)}

   <div class="item" on:click={() => clickSetModule(module.id)} on:keydown={() => keySetModule(module.id)} tabindex="0">
    <img src="img/modules/{module.decl.id}.svg" alt={module.decl.name} />
   </div>
  {/each}

 {:else}
  <div class="item">No modules</div>
 {/if}


</div>
