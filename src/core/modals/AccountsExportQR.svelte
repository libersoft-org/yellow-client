<script>
 import { accounts_config } from '../core.js';
 import QRCode from 'qrcode';
 import { onMount } from 'svelte';

 let qrCodeData = $state('');

 onMount(() => {
  generateQRCode();
 });

 function generateQRCode() {
  const jsonString = JSON.stringify($accounts_config, null, 2);
  QRCode.toDataURL(jsonString, { width: 300 })
   .then(url => (qrCodeData = url))
   .catch(err => console.error('QR CODE GENERATION:', err));
 }
</script>

<style>
 .qr-container {
  display: flex;
  justify-content: center;
  padding: 20px;
 }
</style>

<div class="qr-container">
 {#if qrCodeData}
  <img src={qrCodeData} alt="Account configuration QR code" />
 {:else}
  <div>Generating QR code...</div>
 {/if}
</div>
