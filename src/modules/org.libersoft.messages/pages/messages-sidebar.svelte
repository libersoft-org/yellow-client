<script>
 import { conversationsArray, selectConversation } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import ScrollButton from '../components/scroll-button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalConversationNew from '../modals/conversation-new.svelte';
 import ConversationListItem from '../components/conversation-list-item.svelte';
 let showNewConversationModal = false;
 let scrollButtonVisible;
 let elItems;
 let scrolled = false;

 $: scrollButtonVisible = scrolled;

 function parseScroll(event) {
  scrolled = elItems?.scrollTop > 0;
  //console.log('elItems?.scrollTop:', elItems?.scrollTop);
 }

 function clickNew() {
  showNewConversationModal = true;
 }

 function clickItem(conversation) {
  selectConversation(conversation);
 }

 function scrollToTop() {
  //TODO does not work
  elItems.scrollTop = 0;
 }
</script>

<style>
 .conversations {
  position: relative;
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
 }

 .new img {
  width: 20px;
  height: 20px;
 }

 .items {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
 }
</style>

{#if $conversationsArray != null}
 <div class="conversations">
  <BaseButton onClick={clickNew}>
   <div class="new">
    <img src="img/add.svg" alt="New conversation" />
    <div>New conversation</div>
   </div>
  </BaseButton>
  <div class="items" bind:this={elItems} on:scroll={parseScroll}>
   {#each $conversationsArray as c (c.address)}
    {#key c.address}
     <ConversationListItem {c} {clickItem} />
    {/key}
   {/each}
  </div>
  {#if $conversationsArray.length > 1}
   <ScrollButton visible={scrollButtonVisible} direction={true} right="8px" bottom="7px" onClick={scrollToTop} />
  {/if}
 </div>
 <Modal title="New Conversation" body={ModalConversationNew} bind:show={showNewConversationModal} />
{/if}
