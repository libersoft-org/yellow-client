<script>
 import Button from '../../../core/components/button.svelte';
 import { getContext, tick } from 'svelte';
 import { processMessage } from '../messages.js';
 import MessageRendering from '../components/MessageRendering.svelte';

 export let close;

 let text = '';
 let message_content = '';
 let elTexto;

 $: update1(elTexto);
 async function update1(elTexto) {
  if (!elTexto) return;
  await tick();
  elTexto.focus();
 }

 $: update2(text);
 function update2(text) {
  message_content = processMessage(text);
 }

 const MessageBar = getContext('MessageBar');

 function click() {
  console.log('click');
  MessageBar.sendMessage(text);
  MessageBar.setBarFocus();
  close();
 }
</script>

<style>
 .html {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 800px;
  height: 480px;
 }

 .sides {
  display: flex;
  width: 100%;
  height: 100%;
 }

 .sides .editor {
  border: 1px solid #000;
  width: 50%;
 }

 .sides .editor .text {
  width: calc(100% - 10px);
  height: calc(100% - 10px);
 }

 .sides .preview {
  border: 1px solid #000;
  width: 50%;
 }
</style>

<div class="html">
 <div class="sides">
  <div class="editor">
   <textarea class="text" bind:this={elTexto} bind:value={text} rows="5" cols="30"></textarea>
  </div>
  <div class="preview">
   <MessageRendering {message_content} />
  </div>
 </div>
 <Button text="Send" on:click={click} />
</div>
