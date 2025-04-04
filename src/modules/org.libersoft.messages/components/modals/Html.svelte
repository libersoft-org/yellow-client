<script>
 import Button from '@/core/components/Button/Button.svelte';
 import { getContext } from 'svelte';
 import Switch from '../../../../core/components/Switch/Switch.svelte';
 import HtmlSideBySide from '../HtmlEditor/HtmlSideBySide.svelte';
 import HtmlInTabs from '../HtmlEditor/HtmlInTabs.svelte';
 export let close;
 const MessageBar = getContext('MessageBar');
 let text = '';
 let isSideBySide = true;

 function send() {
  console.log('send');
  MessageBar.sendMessageHtml(text);
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
</style>

<div class="html">
 <div class="switch">
  <Switch bind:checked={isSideBySide} />
  <div>Show editor and preview side by side</div>
 </div>
 {#if isSideBySide}
  <HtmlSideBySide bind:text />
 {:else}
  <HtmlInTabs bind:text />
 {/if}
 <Button text="Send" onClick={send} />
</div>
