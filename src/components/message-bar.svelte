<script>
 export let onSendMessage;
 let messageInput;
 let message = '';
 
 function sendMessage() {
  message = message.trim();
  if (message) {
   onSendMessage(message);
   message = '';
   messageInput.focus();
  }
 }

 function keyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
   event.preventDefault();
   sendMessage();
  }
 }
</script>

<style>
 #message-bar {
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #222;
  box-shadow: var(--shadow);
 }

 .message {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
 }
 
 .icon {
  cursor: pointer;
 }

 .icon img {
  width: 32px;
  height: 32px;
 }
</style>

<div id="message-bar">
 <input class="message" type="text" placeholder="Enter your message ..." bind:this={messageInput} bind:value={message} on:keydown={keyDown} />
 <div class="icon" on:click={sendMessage}><img src="img/send.svg" alt="Send" /></div>
</div>
