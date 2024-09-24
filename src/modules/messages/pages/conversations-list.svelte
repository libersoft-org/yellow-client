<script>
 import { onMount, onDestroy } from 'svelte';
 import Core from '../../../core/core.js';
 import { init, uninit, listMessages, selectedConversation, conversationsArray } from '../messages.js';
 import Photo from '../components/photo.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalConversationNew from '../modals/modal-conversation-new.svelte';
 let isModalOpen = false;
 let modalComponent = null;

 onMount(() => {
  init();
 });

 onDestroy(() => {
  uninit();
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
  selectedConversation.update(() => conversation);
  Core.hideSidebarMobile.update(() => true);
  listMessages(conversation.address);
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
  gap: 8px;
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
  flex-direction: column;
  padding: 10px;
  cursor: pointer;
  background-color: #fffcf0;
  border-bottom: 1px solid #dd9
 }

 .items .item:hover {
  background-color: #fde990;
 }

 .items .item.active {
  background-color: #fd5;
 }

 .items .item .item-row {
  display: flex;
  flex-direction: row;
 }

 .items .item .item-row .description {
  word-break: break-word;
  flex-grow: 1;
  padding: 0 10px;
  overflow: hidden;
 }

 .items .item .item-row .description .name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: bold;
 }

 .items .item .item-row .description .address, .items .item .description .time {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 12px;
 }

 .items .item .text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 8px;
  color: #555;
 }

 .items .item .item-row .count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: bold;
  background-color: #c00;
  color: #fff;
 }

</style>

<div class="conversations">
 <div class="new" role="button" tabindex="0" on:click={clickNew} on:keydown={keyNew}>
  <img src="img/add.svg" alt="New conversation">
  <div>New conversation</div>
 </div>
 <div class="items">
  {#each $conversationsArray as c (c.address)}
  <div class="item" class:active={c.address === $selectedConversation?.address} role="button" tabindex="0" on:click={() => clickItem(c)} on:keydown={() => keyItem(c)}>
   <div class="item-row">
    <Photo />
    <div class="description">
     <div class="contact">
      {#if (c.visible_name)}
       <div class="name">{c.visible_name}</div>
      {/if}
      <div class="address">{c.address}</div>
      <div class="time">{new Date(c.last_message_date.replace(' ', 'T') + 'Z').toLocaleString()}</div>
     </div>
    </div>
    {#if (c.unread_count !== 0 && c.unread_count !== undefined)}
     <div class="count">{c.unread_count}</div>
    {/if}
   </div>
   {#if c.last_message_text.trim()}
    <div class="text">{c.last_message_text.trim()}</div>
   {:else}
    <div class="text">&nbsp;</div>
   {/if}
  </div>
  {/each}
 </div>
</div>
{#if isModalOpen}
<Modal title="New Conversation" onClose={() => isModalOpen = false}>
 <ModalConversationNew onClose={() => isModalOpen = false} />
</Modal>
{/if}
