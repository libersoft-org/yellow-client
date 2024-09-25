<script>

 import Core from '../../core/core.js';

 let module_data = Core.md('messages');

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

 {#each $module_data as m (m.id)}

 <div class="item" role="button" tabindex="0" on:click={() => clickSetModule(m.id)} on:keydown={() => keySetModule(m.id)}><img src="img/modules/messages.svg" alt="Messages" /></div>

 {/each}

</div>
