<script>
 import QRCode from 'qrcode';
 import { onMount } from 'svelte';
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
</style>


{#if qrCodeData}
<div class="qr"><img src={qrCodeData} alt="Seed phrase" /></div>
{/if}
<table>
 <tr>
  <td>
   {#each phrase.split(' ').slice(0, 12) as word, index}
    <div class="cell">{index + 1}. {word}</div>
   {/each}
  </td>
  <td>
   {#each phrase.split(' ').slice(12) as word, index}
    <div class="cell">{index + 13}. {word}</div>
   {/each}
  </td>
 </tr>
</table>
