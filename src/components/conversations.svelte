<script>
 import Photo from '../components/photo.svelte';
 export let conversations = [];
 export let onSelectConversation;
 
 function handleClick(conversation) {
  console.log(conversation);
  onSelectConversation(conversation);
 }
</script>

<style>
 #conversations {
  height: calc(100vh - 50px);
  overflow-y: auto;
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

 .item .description {

 }

 .item .description .name {
  font-weight: bold;
 }

 .item .description .address, .item .description .time {
  font-size: 12px;
 }
</style>

<div id="conversations">
 {#each conversations as c}
 <div class="item" on:click={() => handleClick(c)}>
  
  <Photo />
  <div class="description">
   <div class="name">{c.visible_name}</div>
   <div class="address">{c.address}</div>
   <div class="time">{new Date(c.last_message_date.replace(' ', 'T') + 'Z').toLocaleString()}</div>  
  </div>
 </div>
 {/each}
</div>
