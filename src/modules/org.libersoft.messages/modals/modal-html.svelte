<script>
 import Button from '../../../core/components/button.svelte';
 import { getContext, tick } from 'svelte';
 import { processMessage } from '../messages.js';
 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import Switch from '../../../core/components/switch.svelte';
 import Editor from '../components/html-editor.svelte';
 import Preview from '../components/message-rendering.svelte';
 export let close;
 const MessageBar = getContext('MessageBar');
 let messageContent = '';
 let elText;
 let text = '';
 let activeTab = 'editor';
 const tabs = {
  editor: Editor,
  preview: Preview,
 };

 function setTab(e, name) {
  activeTab = name;
 }

 $: update1(elText);

 async function update1(elText) {
  if (!elText) return;
  await tick();
  elText.focus();
 }

 $: update2(text);

 function update2(text) {
  messageContent = processMessage(text);
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

 .container {
  border: 1px solid #000;
  border-radius: 10px;
  overflow: auto;
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
  <div>Show editor and preview side by side</div>
 </div>
 <div>
  <Tabs>
   <Item label="HTML editor" active={activeTab === 'editor'} onClick={e => setTab(e, 'editor')} />
   <Item label="Preview" active={activeTab === 'preview'} onClick={e => setTab(e, 'preview')} />
  </Tabs>
 </div>
 <div class="container">
  <svelte:component this={tabs[activeTab]} />
 </div>
 <hr style="width: 100%" />
 <div class="sides">
  <div class="editor">
   <Editor {elText} {text} />
   <!-- <textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea> -->
  </div>
  <div class="preview">
   <Preview {messageContent} />
  </div>
 </div>
 <Button text="Send" on:click={click} />
</div>
