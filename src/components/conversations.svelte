<script>
 import Photo from '../components/photo.svelte';
 import Modal from '../components/modal.svelte';
 import ModalConversationNew from '../components/modal-conversation-new.svelte';
 export let conversationsArray = [];
 export let onSelectConversation;
 export let openNewConversation;
 let selectedConversationAddress = null;
 let isModalOpen = false;
 let modalComponent = null;

 function clickNew() {
  modalComponent = ModalConversationNew;
  isModalOpen = true;
 }

 function keyNew() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickNew();
  }
 }

 function clickItem(conversation) {
  console.log(conversation);
  selectedConversationAddress = conversation.address;
  onSelectConversation(conversation);
 }

 function keyItem(conversation) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickItem(conversation);
  }
 }
</script>

<style>
 #conversations {
  overflow-y: auto;
 }

 .new {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-weight: bold;
  background-color: #222;
  color: #fff;
  cursor: pointer;
 }

 .new img {
  width: 20px;
  height: 20px;
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

 .item.active {
  background-color: #fd5;
 }

 .item .description .name {
  font-weight: bold;
 }

 .item .description .address, .item .description .time {
  font-size: 12px;
 }
</style>

<div id="conversations">
 <div class="new" role="button" tabindex="0" on:click={clickNew} on:keydown={keyNew}>
  <img src="img/add.svg" alt="New conversation">
  <div>New conversation</div>
 </div>
 {#each conversationsArray as c}
 <div class="item" class:active={c.address === selectedConversationAddress} role="button" tabindex="0" on:click={() => clickItem(c)} on:keydown={() => keyItem(c)}>
  <Photo />
  <div class="description">
   <div class="name">{c.visible_name}</div>
   <div class="address">{c.address}</div>
   <div class="time">{new Date(c.last_message_date.replace(' ', 'T') + 'Z').toLocaleString()}</div>  
  </div>
 </div>
 {/each}
</div>
{#if isModalOpen}
<Modal title="New Conversation" onClose={() => isModalOpen = false}>
 <ModalConversationNew {openNewConversation} onClose={() => isModalOpen = false} />
</Modal>
{/if}
