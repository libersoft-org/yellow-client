<script>
import { loadMessages } from '../messages.js';

 export let loader;


 function mouseDown() {
  console.log('mouseDown');
  loader.loading = true;
  loadMessages(loader.conversation.acc, loader.conversation.address, loader.base, loader.prev, loader.next);
 }


</script>


<pre>
{JSON.stringify({...loader}, null, 2)}
</pre>
<button on:click={mouseDown}>Click me</button>
