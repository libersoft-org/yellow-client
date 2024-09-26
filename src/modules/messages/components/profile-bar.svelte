<script>
 import { md } from '../messages.js';
 import Photo from './photo.svelte';
 export let closeConversation;

 let selectedConversation;
 $: selectedConversation = $md.selectedConversation;

 function clickClose() {
  closeConversation();
 }

 function keyClose() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickClose();
  }
 }
</script>

<style>
 .profile-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: calc(var(--menu-height) - 20px);
  padding: 10px;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
 }

 .description {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex-grow: 1;
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
 <Photo />
 <div class="description">
  {#if $selectedConversation.visible_name}
   <div class="visible_name">{$selectedConversation.visible_name}</div>
  {/if}
  <div class="address">{$selectedConversation.address}</div>
 </div>
 <div class="close" role="button" tabindex="0" on:click={clickClose} on:keydown={keyClose}><img src="img/close.svg" alt="Close" /></div>
</div>


