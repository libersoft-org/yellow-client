<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 import Photo from './photo.svelte';
 import { selectedConversation, ensureConversationDetails } from '../messages.js';
 export let c;
 export let clickItem;

 $: ensureConversationDetails(c);
</script>

<style>
 .item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #fffcf0;
  border-bottom: 1px solid #dd9;
 }

 .item:hover {
  background-color: #fde990;
 }

 .item.active {
  background-color: #fd5;
 }

 .item .item-row {
  display: flex;
  flex-direction: row;
 }

 .item .item-row .description {
  word-break: break-word;
  flex-grow: 1;
  padding: 0 10px;
  overflow: hidden;
 }

 .item .item-row .description .name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: bold;
 }

 .item .item-row .description .address {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 12px;
 }

 .item .text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 8px;
  color: #555;
 }

 .item .item-row .count {
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

<BaseButton onClick={() => clickItem(c)}>
 <div class="item" class:active={c.address === $selectedConversation?.address}>
  <div class="item-row">
   <Photo size="50" />
   <div class="description">
    <div class="contact">
     {#if c.visible_name}
      <div class="name">{c.visible_name}</div>
     {/if}
     <div class="address">{c.address}</div>
     <div class="time">{new Date(c.last_message_date /*.replace(' ', 'T') + 'Z'*/).toLocaleString()}</div>
    </div>
   </div>
   {#if c.unread_count !== 0 && c.unread_count !== undefined}
    <div class="count">{c.unread_count}</div>
   {/if}
  </div>
  {#if c.last_message_text.trim()}
   <div class="text">{c.last_message_text.trim()}</div>
  {:else}
   <div class="text">&nbsp;</div>
  {/if}
 </div>
</BaseButton>
