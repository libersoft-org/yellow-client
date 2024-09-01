<script>
 import Photo from '../components/photo.svelte';
 export let conversationsArray = [];
 export let onSelectConversation;
 
 function clickNew() {
  // TODO: add modal window
 }

 function keyNew() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickItem();
  }
 }

 function clickItem(conversation) {
  onSelectConversation(conversation);
 }

 function keyItem(conversation) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickItem();
  }
 }
</script>

<style>
 #conversations {
  overflow-y: auto;
 }

 .new {
  padding: 10px;
  font-weight: bold;
  background-color: #222;
  color: #fff;
  cursor: pointer;
 }

 .item {
  display: flex;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  background-color: #fffcf0;
  align-items: center;
 }

 .item:hover {
  background-color: #fde990;
 }

 .item .description .name {
  font-weight: bold;
 }

 .item .description .address, .item .description .time {
  font-size: 12px;
 }
</style>

<div id="conversations">
 <div class="new" role="button" tabindex="0" on:click={clickNew} on:keydown={keyNew}>+ New conversation</div>
 {#each conversationsArray as c}
 <div class="item" role="button" tabindex="0" on:click={() => clickItem(c)} on:keydown={() => keyItem(c)}>
  <Photo />
  <div class="description">
   <div class="name">{c.visible_name}</div>
   <div class="address">{c.address}</div>
   <div class="time">{new Date(c.last_message_date.replace(' ', 'T') + 'Z').toLocaleString()}</div>  
  </div>
 </div>
 {/each}
</div>
