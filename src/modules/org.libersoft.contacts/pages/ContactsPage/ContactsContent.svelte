<script>
 import { onMount } from 'svelte';
 import Dialog from '@/core/components/Dialog/Dialog.svelte';
 let elDialog;
 let closeDialog;
 let dialogData = {
  title: 'Dialog title',
  body: 'Dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content.',
  icon: 'img/photo.svg',
  buttons: [
   { text: 'Abort', onClick: clickButton, expand: true },
   { text: 'Retry', onClick: clickButton, expand: true },
   { text: 'Close', onClick: () => closeDialog(), expand: true },
  ],
 };

 onMount(() => {
  elDialog.open();
 });

 function clickButton() {
  console.log('Clicked on button');
 }
</script>

<style>
 .content {
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
  overflow: hidden;
 }
</style>

<div class="content">Contact list - content page - not yet implemented</div>
<Dialog data={dialogData} bind:close={closeDialog} bind:this={elDialog} />
