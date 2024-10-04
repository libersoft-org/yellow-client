<script>
 import { get } from 'svelte/store';
 import QRCode from 'qrcode';
 import { selectedWallet } from '../wallet.ts';
 let qrCodeData = '';

 $: if ($selectedWallet) generateQRCode();

 function generateQRCode() {
  QRCode.toDataURL(get(selectedWallet).address, { width: 150 })
  .then(url => qrCodeData = url)
  .catch(err => console.error(err));
 };
</script>

<style>
</style>

{#if $selectedWallet}
 <div>{$selectedWallet.address}</div>
 <div class="qr"><img src={qrCodeData} alt={$selectedWallet.address} /></div>
{:else}
 <div>No wallet selected</div>
{/if}
