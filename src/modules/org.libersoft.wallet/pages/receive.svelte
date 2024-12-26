<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 import QRCode from 'qrcode';
 import { currencies, selectedMainCurrencySymbol, selectedAddress, selectedNetwork } from '../wallet.ts';
 import { parseUnits } from 'ethers';
 import { get } from 'svelte/store';
 import DropdownFilter from '../../../core/components/dropdown-filter.svelte';
 let addressElement;
 let paymentElement;
 let amount = '0';
 let qrAddress = '';
 let qrPayment = '';
 let paymentText = '';
 let error = '';
 let currency;

 $: resetCurrency(currencies);

 function resetCurrency(currencies) {
  if (!currency || !get(currencies).find(c => c == currency)) {
   console.log('reset currency:', currency, get(currencies));
   currency = $selectedMainCurrencySymbol;
  }
 }

 $: console.log('currencies:', $currencies);
 $: console.log('currency:', currency);

 function clickCopyAddress() {
  navigator.clipboard
   .writeText($selectedAddress.address)
   .then(() => console.log('Address copied to clipboard'))
   .catch(err => console.error('Error while copying to clipboard', err));
  addressElement.innerHTML = 'Copied!';
  setTimeout(() => (addressElement.innerHTML = $selectedAddress.address), 1000);
 }

 function clickCopyPayment() {
  navigator.clipboard
   .writeText(paymentText)
   .then(() => console.log('Payment URI copied to clipboard'))
   .catch(err => console.error('Error while copying to clipboard', err));
  paymentElement.innerHTML = 'Copied!';
  setTimeout(() => (paymentElement.innerHTML = paymentText), 1000);
 }

 $: if ($selectedNetwork && $selectedAddress) updateAmount(amount);

 function updateAmount(amount) {
  let etherValue;
  console.log('amount:', amount);
  try {
   etherValue = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
   console.log('etherValue:', etherValue.toString());
  } catch (e) {
   error = 'Invalid amount';
   console.log('Invalid amount:', e);
   return;
  }
  error = '';
  paymentText = 'ethereum:' + $selectedAddress.address + '@' + $selectedNetwork.chainID + (amount ? '?value=' + etherValue.toString() : '');
  generateQRCode($selectedAddress.address, url => (qrAddress = url));
  generateQRCode(paymentText, url => (qrPayment = url));
 }

 function generateQRCode(text, callback) {
  QRCode.toDataURL(text, { width: 150 }, function (err, url) {
   if (err) console.error('QR CODE GENERATION:', err);
   else callback(url);
  });
 }
</script>

<style>
 input {
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
 }

 .address img {
  width: 15px;
  height: 15px;
 }

 .amount {
  display: flex;
  align-items: center;
  gap: 5px;
 }

 .error {
  color: #f00;
 }
</style>

<div class="receive">
 {#if $selectedNetwork && $selectedAddress}
  <div class="section">
   <div class="bold">Your wallet address:</div>
   <BaseButton onClick={clickCopyAddress}>
    <div class="address">
     <div bind:this={addressElement}>{$selectedAddress.address}</div>
     <img src="img/copy.svg" alt="Copy" />
    </div>
   </BaseButton>
   <div class="qr"><img src={qrAddress} alt="Address" /></div>
  </div>
  <div class="section">
   <div class="bold">Payment:</div>
   <div class="amount">
    <div>Amount:</div>
    <input type="number" placeholder="0.0" step="0.00001" min="0" max="999999999999999999999999" bind:value={amount} />
    <DropdownFilter options={$currencies} bind:selected={currency} />
    <div class="error">{error}</div>
   </div>
   <BaseButton onClick={clickCopyPayment}>
    <div class="address">
     <div bind:this={paymentElement}>{paymentText}</div>
     <img src="img/copy.svg" alt="Copy" />
    </div>
   </BaseButton>
   <div class="qr"><img src={qrPayment} alt="Payment" /></div>
  </div>
 {:else}
  <div>No wallet selected</div>
 {/if}
</div>
