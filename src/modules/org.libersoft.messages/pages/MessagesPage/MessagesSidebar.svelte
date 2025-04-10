<script>
 import { identifier, conversationsArray, selectConversation } from '../../messages.js';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import Modal from '@/core/components/Modal/Modal.svelte';
 import ScrollButton from '../../components/ScrollButton/ScrollButton.svelte';
 import ModalNewConversation from '../../modals/NewConversation.svelte';
 import ModalMessageSettings from '../../modals/MessageSettings.svelte';
 import ConversationListItem from '../../components/Conversation/ConversationListItem.svelte';
 let showNewConversationModal = false;
 let showMessageSettings = false;
 let scrollButtonVisible;
 let elItems;
 let scrolled = false;

 $: scrollButtonVisible = scrolled;

 function parseScroll(event) {
  scrolled = elItems?.scrollTop > 0;
  //console.log('elItems?.scrollTop:', elItems?.scrollTop);
 }

 function clickNewConversation() {
  showNewConversationModal = true;
 }

 function clickMessagesSettings() {
  showMessageSettings = true;
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

 .bar-buttons {
  display: flex;
  background-color: #222;
 }

 .bar-buttons .space {
  flex: 1;
 }

 .bar-button {
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-word;
  overflow: hidden;
  padding: 15px;
  font-weight: bold;
  background-color: #222;
  color: #fff;
 }

 .bar-button img {
  width: 28px;
  height: 28px;
 }

 .bar-button .new {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
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
  <div class="bar-buttons">
   <BaseButton onClick={clickNewConversation}>
    <div class="bar-button">
     <img src="modules/{identifier}/img/new_conversation.svg" alt="New conversation" />
     <div class="new">New conversation</div>
    </div>
   </BaseButton>
   <div class="space"></div>
   <BaseButton onClick={clickMessagesSettings}>
    <div class="bar-button">
     <Icon img="img/settings.svg" alt="Message settings" colorVariable="--icon-white" size="28" padding="0" />
    </div>
   </BaseButton>
  </div>
  <div class="items" bind:this={elItems} on:scroll={parseScroll}>
   {#each $conversationsArray as c (c.address)}
    {#key c.address}
     <ConversationListItem {c} {clickItem} />
    {/key}
   {/each}
  </div>
  {#if $conversationsArray.length > 1}
   <ScrollButton visible={scrollButtonVisible} direction={true} right="15px" bottom="10px" onClick={scrollToTop} />
  {/if}
 </div>
 <Modal title="New Conversation" body={ModalNewConversation} bind:show={showNewConversationModal} />
 <Modal title="Message settings" body={ModalMessageSettings} bind:show={showMessageSettings} />
{/if}
