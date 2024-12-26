<script>
 import { onMount } from 'svelte';
 import QRCode from 'qrcode';
 import Button from '../../../core/components/button.svelte';
 import { generateMnemonic, addWallet } from '../wallet.ts';
 export let close;
 let mnemonic = {};
 let phrase = '';
 let qrCodeData = '';

 onMount(() => {
  regenerate();
 });

 function generateQRCode() {
  QRCode.toDataURL(phrase, { width: 150 })
   .then(url => (qrCodeData = url))
   .catch(err => console.error(err));
 }

 function regenerate() {
  console.log('REGENERATE');
  mnemonic = generateMnemonic();
  phrase = mnemonic.phrase;
  generateQRCode();
 }

 function save() {
  // TODO: password protect the key
  console.log('SAVE');
  addWallet(mnemonic);
  close();
 }

 function print() {
  // TODO: print preview and print
  console.log('PRINT');
  const newWindow = window.open('', '_blank');
  newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QR Code</title>
      <style>
        .qr {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        .cell {
          padding: 5px;
          border: 1px solid #000;
        }
        table {
          margin: 20px auto;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
      <div>Use the following QR code to transfer your wallet seed phrase to your other device, never show it to anyone else!</div>
      <div class="qr"><img src="${qrCodeData}" alt="Seed phrase" /></div>
      <div>Write down or print these 24 words, also known as seed phrase. It will serve as a backup of your wallet. Cut it into 2 parts (12 + 12 words) and hide it in 2 different places, where you don't have your devices. Never show it to anyone else!</div>
      <table>
        <tr>
          <td>
            ${phrase
             .split(' ')
             .slice(0, 6)
             .map((word, index) => `<div class="cell">${index + 1}. ${word}</div>`)
             .join('')}
          </td>
          <td>
            ${phrase
             .split(' ')
             .slice(6, 12)
             .map((word, index) => `<div class="cell">${index + 7}. ${word}</div>`)
             .join('')}
          </td>
          <td>
            ${phrase
             .split(' ')
             .slice(12, 18)
             .map((word, index) => `<div class="cell">${index + 13}. ${word}</div>`)
             .join('')}
          </td>
          <td>
            ${phrase
             .split(' ')
             .slice(18, 24)
             .map((word, index) => `<div class="cell">${index + 19}. ${word}</div>`)
             .join('')}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
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
 <tbody>
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
 </tbody>
</table>
<div class="buttons">
 <Button width="96px" text="Save" onClick={save} />
 <Button width="96px" text="Print" onClick={print} />
 <Button width="96px" text="Regenerate" onClick={regenerate} />
</div>
