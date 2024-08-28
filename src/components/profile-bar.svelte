<script>
 export let selectedConversation;
</script>

<style>
 #profile-bar {
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  min-height: 30px;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
 }
</style>

<div id="profile-bar">
 <div class="bold">{selectedConversation.address}</div>
</div>
