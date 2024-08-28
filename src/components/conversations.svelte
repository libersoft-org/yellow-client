<script>
 export let conversations = [];
 export let onSelectConversation;

 function handleClick(conversation) {
  onSelectConversation(conversation);
 }
</script>

<style>
 #conversations {
  height: calc(100vh - 50px);
  overflow-y: auto;
 }

 .item {
  padding: 10px;
  cursor: pointer;
  background-color: #fffcf0;
 }

 .item:hover {
  background-color: #fde990;
 }

 .address {
  font-weight: bold;
 }

 .time {
  font-size: 12px;
 }
</style>

<div id="conversations">
 {#each conversations as c}
 <div class="item" on:click={() => handleClick(c)}>
  <div class="address">{c.address}</div>
  <div class="time">{c.lastMessageDate}</div>  
 </div>
 {/each}
</div>
