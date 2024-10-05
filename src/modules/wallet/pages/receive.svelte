<script>
 import QRCode from 'qrcode';
 import { selectedAddress, selectedNetwork } from '../wallet.ts';
 let addressElement;
 let paymentElement;
 let amount;
 let qrAddress = '';
 let qrPayment = '';
 let paymentText = '';

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

 function clickCopyPayment() {
  navigator.clipboard.writeText(paymentText)
  .then(() => console.log('Payment URI coppied to clipboard'))
  .catch(err => console.error('Error while copying to clipboard', err));
  paymentElement.innerHTML = ('Copied!');
  setTimeout(() => paymentElement.innerHTML = paymentText, 1000);
 }

 function keyCopyPayment() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCopyPayment();
  }
 }

 $: if ($selectedNetwork && $selectedAddress) {
  paymentText = 'ethereum:' + $selectedAddress.address + '@' + $selectedNetwork.chainID + (amount ? '?value=' + ((BigInt(amount) * BigInt(10) ** BigInt(18)).toString()) : '');
  generateQRCode($selectedAddress.address, (url) => qrAddress = url);
  generateQRCode(paymentText, (url) => qrPayment = url);
 }

 function generateQRCode(text, callback) {
  QRCode.toDataURL(text, { width: 150 }, function (err, url) {
   if (err) console.error('QR CODE GENERATION:', err);
   else callback(url);
  });
 };
</script>

<style>
 input, select {
  padding: 5px;
  border: 1px solid #000;
  border-radius: 10px;
  background-color: #fff;
 }

 .receive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
 }

 .section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 10px;
 }

 .address {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #b90;
  border-radius: 10px;
  padding: 10px;
  background-color: #ffa;
  cursor: pointer;
 }

 .address img {
  width: 15px;
  height: 15px;
 }
</style>

<div class="receive">
 {#if $selectedNetwork && $selectedAddress}
  <div class="section">
   <div class="bold">Your wallet address:</div> 
   <div class="address" role="button" tabindex="0" on:click={clickCopyAddress} on:keydown={keyCopyAddress}>
    <div bind:this={addressElement}>{$selectedAddress.address}</div>
    <img src="img/copy.svg" alt="Copy" />
   </div>
   <div class="qr"><img src={qrAddress} alt="Address" /></div>
  </div>
  <div class="section">
   <div class="bold">Payment:</div>
   <div>
    <span>Amount:</span>
    <span><input type="text" bind:value={amount} /></span>
    <span><select><option value="0">--- Currency ---</option></select></span>
   </div>
   <div class="address" role="button" tabindex="0" on:click={clickCopyPayment} on:keydown={keyCopyPayment}>
    <div bind:this={paymentElement}>{paymentText}</div>
    <img src="img/copy.svg" alt="Copy" />
   </div>
   <div class="qr"><img src={qrPayment} alt="Payment" /></div>
  </div>
 {:else}
  <div>No wallet selected</div>
 {/if}
</div>
