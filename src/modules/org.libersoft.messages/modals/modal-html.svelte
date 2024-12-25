<script>
 import Button from '../../../core/components/button.svelte';
 import { getContext, tick } from 'svelte';
 import { processMessage } from '../messages.js';
 import Tabs from '../../../core/components/tabs.svelte';
 import Switch from '../../../core/components/switch.svelte';
 import Editor from '../components/html-editor.svelte';
 import Preview from '../components/message-rendering.svelte';
 export let close;
 const MessageBar = getContext('MessageBar');
 let text = '';
 let message_content = '';
 let elText;

 const tabItems = [
  {
   label: 'Editor',
   value: 1,
   component: Editor,
  },
  {
   label: 'Preview',
   value: 2,
   component: Preview,
  },
 ];

 $: update1(elText);

 async function update1(elText) {
  if (!elText) return;
  await tick();
  elText.focus();
 }

 $: update2(text);

 function update2(text) {
  message_content = processMessage(text);
 }

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

 .switch {
  display: flex;
  align-items: center;
  gap: 10px;
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

 .sides .preview {
  border: 1px solid #000;
  width: 50%;
 }
</style>

<div class="html">
 <div class="switch">
  <div><Switch /></div>
  <div>Show side by side</div>
 </div>
 <Tabs items={tabItems} />
 <hr style="width: 100%" />
 <div class="sides">
  <div class="editor">
   <Editor {text} />
   <!-- <textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea> -->
  </div>
  <div class="preview">
   <Preview {message_content} />
  </div>
 </div>
 <Button text="Send" on:click={click} />
</div>
