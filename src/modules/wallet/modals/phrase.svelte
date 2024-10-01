<script>
 import { onMount } from 'svelte';
 import QRCode from 'qrcode';
 import Button from '../../../core/components/button.svelte';
 export let phrase = '';
 let qrCodeData = '';

 onMount(() => {
  generateQRCode();
 });

 function generateQRCode() {
  QRCode.toDataURL(phrase, { width: 150 })
  .then(url => qrCodeData = url)
  .catch(err => console.error(err));
 };

 function save() {
  // TODO: password protect the key and add it to localStorage
  console.log('SAVE');
 }

 function print() {
  // TODO: print preview and print
  console.log('PRINT');
 }

 function regenerate() {
  // TODO: create a new seed phrase + QR code
  console.log('REGENERATE');
 }
</script>

<style>
 .qr {
  display: flex;
  justify-content: center;
 }

 .cell {
  padding: 5px;
  border: 1px solid #000;
 }

 .buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
 }
</style>

{#if qrCodeData}
 <div>Use the following QR code to transfer your wallet seed phrase to your other device, never show it to anyone else!</div>
 <div class="qr"><img src={qrCodeData} alt="Seed phrase" /></div>
{/if}
<div>Write down or print these 24 words, also known as seed phrase. It will serve as a backup of your wallet. Cut it into 2 parts (12 + 12 words) and hide it in 2 different places, where you don't have your devices. Never show it to anyone else!</div>
<table>
 <tr>
  <td>
   {#each phrase.split(' ').slice(0, 6) as word, index}
    <div class="cell">{index + 1}. {word}</div>
   {/each}
  </td>
  <td>
   {#each phrase.split(' ').slice(6, 12) as word, index}
    <div class="cell">{index + 7}. {word}</div>
   {/each}
  </td>
  <td>
   {#each phrase.split(' ').slice(12, 18) as word, index}
    <div class="cell">{index + 13}. {word}</div>
   {/each}
  </td>
  <td>
   {#each phrase.split(' ').slice(18, 24) as word, index}
    <div class="cell">{index + 19}. {word}</div>
   {/each}
  </td>
 </tr>
</table>
<div class="buttons">
 <Button width="96px" text="Save" on:click={save} />
 <Button width="96px" text="Print" on:click={print} />
 <Button width="96px" text="Regenerate" on:click={regenerate} />
</div>
