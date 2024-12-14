<script>
 import { selectedConversation } from '../messages.js';
 import Icon from '../../../core/components/icon.svelte';
 import Photo from './photo.svelte';
 export let closeConversation;

 function clickClose() {
  closeConversation();
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
</style>

<div class="profile-bar">
 <Icon img="img/back-white.svg" alt="Back" onClick={clickClose} visibleOnDesktop={false} />
 <Photo size="38" />
 <div class="description">
  {#if $selectedConversation.visible_name}
   <div class="visible_name">{$selectedConversation.visible_name}</div>
  {/if}
  <div class="address">{$selectedConversation.address}</div>
 </div>
 <Icon img="img/close.svg" alt="Close" onClick={clickClose} visibleOnMobile={false} />
</div>
