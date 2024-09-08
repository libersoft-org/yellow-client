<script>
 import { onMount } from 'svelte';
 import { selectedConversation } from '../messages.js';
 import Photo from './photo.svelte';
 export let closeConversation;

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
  flex-grow: 1;
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
   <div class="bold">{$selectedConversation.visible_name}</div>
  {/if}
  <div class="address">{$selectedConversation.address}</div>
 </div>
 <div class="close" role="button" tabindex="0" on:click={clickClose} on:keydown={keyClose}><img src="img/close.svg" alt="Close" /></div>
</div>


