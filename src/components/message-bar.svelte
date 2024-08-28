<script>
 export let onSendMessage;
 let message = '';

 function sendMessage() {
  message = message.trim();
  if (message) {
   onSendMessage(message);
   message = '';
  }
 }
</script>

<style>
 #message-bar {
  z-index: 100;
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #222;
  box-shadow: var(--shadow);
 }

 input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
 }
</style>

<div id="message-bar">
 <input bind:value={message} type="text" placeholder="Enter your message ..." />
 <div class="button" on:click={sendMessage({message})}>Send</div>
</div>
