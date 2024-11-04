<script>
import { loadMessages } from '../messages.js';

 export let loader;


 function mouseDown() {
  console.log('mouseDown');
  loader.loading = true;
  loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next);
 }


</script>


{JSON.stringify({...loader,conversation:undefined}, null, 2)}

<button on:click={mouseDown}>Click me</button>
