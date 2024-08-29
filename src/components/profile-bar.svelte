<script>
 import Photo from '../components/photo.svelte';
 export let selectedConversation;
</script>

<style>
 #profile-bar {
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
 }

 .description .address {
  font-size: 12px;
 }
</style>

<div id="profile-bar">
 <Photo />
 <div class="description">
  <div class="bold">{selectedConversation.visible_name}</div>
  <div class="address">{selectedConversation.address}</div>
 </div>
</div>
