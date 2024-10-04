<script>
 import { get } from 'svelte/store';
 import QRCode from 'qrcode';
 import { selectedAddress } from '../wallet.ts';
 let addressElement;
 let qrCodeData = '';

 function clickCopyAddress() {
  navigator.clipboard.writeText($selectedAddress.address)
  .then(() => console.log('Address coppied to clipboard'))
  .catch(err => console.error('Error while copying to clipboard', err));
  addressElement.innerHTML = ('Copied!');
  setTimeout(() => addressElement.innerHTML = $selectedAddress.address, 1000);
 }

 function keyCopyAddress() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCopyAddress();
  }
 }

 $: if ($selectedAddress) generateQRCode();

 function generateQRCode() {
  QRCode.toDataURL(get(selectedAddress).address, { width: 150 })
  .then(url => qrCodeData = url)
  .catch(err => console.error(err));
 };
</script>

<style>
 .receive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
 }

 .receive .address {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #b90;
  border-radius: 10px;
  padding: 10px;
  background-color: #ffa;
  cursor: pointer;
 }

 .receive .address img {
  width: 15px;
  height: 15px;
 }
</style>

<div class="receive">
 {#if $selectedAddress}
  <div>Your wallet address:</div> 
  <div class="address" role="button" tabindex="0" on:click={clickCopyAddress} on:keydown={keyCopyAddress}>
   <div bind:this={addressElement}>{$selectedAddress.address}</div>
   <img src="img/copy.svg" alt="Copy" />
  </div>
  <div class="qr"><img src={qrCodeData} alt={$selectedAddress.address} /></div>
 {:else}
  <div>No wallet selected</div>
 {/if}
</div>