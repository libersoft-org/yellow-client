<script>
 export let message;
 export let isOutgoing;
</script>

<style>
 .message {
  max-width: 60%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 10px;
  box-shadow: var(--shadow);
 }

 .message.incoming {
  background-color: #fef3c3;
  align-self: flex-start;
 }

 .message.outgoing {
  background-color: #fefdf7;
  align-self: flex-end;
 }

 .message .text {
  padding-bottom: 10px;
 }

 .message .time {
  font-size: 12px;
  text-align: right;
 }
</style>

<div class="message {isOutgoing ? 'outgoing' : 'incoming'}">
 <div class="bold">{message.address_from}</div>
 <div class="text">{message.message}</div>
 <div class="time">{new Date(message.created.replace(' ', 'T') + 'Z').toLocaleString()}</div>
</div>
