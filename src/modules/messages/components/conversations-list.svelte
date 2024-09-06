<script>
 import { onMount } from 'svelte';
 import { conversationsArray, init } from '../messages.js';
 import Photo from './photo.svelte';
 import Modal from '../../../components/modal.svelte';
 import ModalConversationNew from './modal-conversation-new.svelte';
 
 //export let conversationsArray = [];
 export let onSelectConversation;
 export let openNewConversation;
 let selectedConversationAddress = null;
 let isModalOpen = false;
 let modalComponent = null;

 onMount(() => {
  init();
 });

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
 .conversations {
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

 .items {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100%;
 }

 .items .item {
  display: flex;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  background-color: #fffcf0;
  align-items: center;
 }

 .items .item:hover {
  background-color: #fde990;
 }

 .items .item.active {
  background-color: #fd5;
 }

 .items .item .description {
  word-break: break-word;
 }

 .items .item .description .name {
  font-weight: bold;
 }

 .items .item .description .address, .items .item .description .time {
  font-size: 12px;
 }
</style>

<div class="conversations">
 <div class="new" role="button" tabindex="0" on:click={clickNew} on:keydown={keyNew}>
  <img src="img/add.svg" alt="New conversation">
  <div>New conversation</div>
 </div>
 <div class="items">
  {#each $conversationsArray as c}
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
</div>
{#if isModalOpen}
<Modal title="New Conversation" onClose={() => isModalOpen = false}>
 <ModalConversationNew {openNewConversation} onClose={() => isModalOpen = false} />
</Modal>
{/if}
