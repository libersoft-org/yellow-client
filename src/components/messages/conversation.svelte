<script>
 import ProfileBar from './profile-bar.svelte';
 import MessagesList from './messages-list.svelte';
 import MessageBar from './message-bar.svelte';
 export let selectedConversation;
 export let messagesArray;
 export let userAddress;
 export let sendMessage;
</script>

<style>
 .conversation {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: url('img/background.webp') repeat;
  background-size: 400px;
 }
</style>

<div class="conversation">
 <ProfileBar {selectedConversation} onClose={() => selectedConversation = null} />
 <MessagesList {messagesArray} {userAddress} />
 <MessageBar onSendMessage={sendMessage} />
</div>
