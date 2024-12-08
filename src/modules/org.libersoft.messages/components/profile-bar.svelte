<script>
 import { selectedConversation } from '../messages.js';
 import Photo from './photo.svelte';
 export let closeConversation;

 function clickClose() {
  closeConversation();
 }

 function keyClose(event) {
  // TODO use Button
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickClose();
  }
 }
</script>

<style>
 .profile-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  max-height: calc(var(--menu-height) - 20px);
  height: calc(var(--menu-height) - 20px);
  padding: 10px;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
 }

 .description {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
 }

 .description .visible_name,
 .description .address {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 }

 .description .visible_name {
  font-weight: bold;
 }

 .description .address {
  font-size: 12px;
 }

 .close {
  padding: 10px;
  cursor: pointer;
 }

 .close img {
  width: 24px;
  height: 24px;
 }
</style>

<div class="profile-bar">
 <Photo size="38" />
 <div class="description">
  {#if $selectedConversation.visible_name}
   <div class="visible_name">{$selectedConversation.visible_name}</div>
  {/if}
  <div class="address">{$selectedConversation.address}</div>
 </div>
 <div class="close" role="button" tabindex="0" on:click={clickClose} on:keydown={keyClose}><img src="img/close.svg" alt="Close" /></div>
</div>
