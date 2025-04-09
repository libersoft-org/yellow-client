<script>
 import { onMount } from 'svelte';
 import Dialog from '@/core/components/Dialog/Dialog.svelte';
 let elDialog;
 let closeDialog;
 let dialogData = {
  title: 'Exit application',
  body: 'Would you really like to exit the application?',
  icon: 'img/photo.svg',
  buttons: [
   { text: 'Yes', onClick: clickButton, expand: true },
   { text: 'No', onClick: () => closeDialog(), expand: true },
  ],
 };

 export function open() {
  elDialog.open();
 }

 function clickButton() {
  window.close();
 }
</script>

<Dialog data={dialogData} bind:close={closeDialog} bind:this={elDialog} />
