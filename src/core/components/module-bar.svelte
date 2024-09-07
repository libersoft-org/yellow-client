<script>
 export let selectedModule;

 function clickSetModule(name) {
  selectedModule = name;
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
 <div class="item" role="button" tabindex="0" on:click={() => clickSetModule('messages')} on:keydown={() => keySetModule('messages')}><img src="img/modules/messages.svg" alt="Messages" /></div>
 <div class="item" role="button" tabindex="0" on:click={() => clickSetModule('contacts')} on:keydown={() => keySetModule('contacts')}><img src="img/modules/contacts.svg" alt="Contacts" /></div>
</div>
