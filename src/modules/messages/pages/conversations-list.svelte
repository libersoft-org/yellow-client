<script>
 import { conversationsArray } from '../messages.js';
 import { selectConversation } from '../conversations.js';
 import Modal from '../../../core/components/modal.svelte';
 import ModalConversationNew from '../modals/modal-conversation-new.svelte';
 import ConversationListItem from '../components/conversation-list-item.svelte';

 let isModalOpen = false;
 let modalComponent = null;

 $: console.log('conversations-list.svelte: conversationsArray: ', $conversationsArray);

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
  selectConversation(conversation);
 }
</script>

{#if $conversationsArray != null}
 <div class="conversations">
  <div class="new" role="button" tabindex="0" on:click={clickNew} on:keydown={keyNew}>
   <img src="img/add.svg" alt="New conversation" />
   <div>New conversation</div>
  </div>
  <div class="items">
   {#each $conversationsArray as c (c.address)}
    {#key c.address}
     <ConversationListItem {c} {clickItem} />
    {/key}
   {/each}
  </div>
 </div>
 {#if isModalOpen}
  <Modal title="New Conversation" onClose={() => (isModalOpen = false)}>
   <ModalConversationNew onClose={() => (isModalOpen = false)} />
  </Modal>
 {/if}
{/if}

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
</style>
