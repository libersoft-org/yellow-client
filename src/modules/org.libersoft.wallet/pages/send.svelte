<script>
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import DropdownFilter from '../../../core/components/dropdown-filter.svelte';
 import SendModal from '../modals/send.svelte';
 import { get } from 'svelte/store';
 import { currencies, selectedMainCurrencySymbol, sendTransaction } from '../wallet.ts';
 import { parseUnits } from 'ethers';

 let currency = 'kETH';
 let address = '0xEF017eD170f0Ec1f6C42f7A1bEFf133C261C1573'; // TODO: "ENS name"';
 let amount = 0.001;
 let fee = 0.001;

 let etherValue;
 let etherValueFee;
 let error;

 let showSendModal = false;

 $: if (!currency || !get(currencies).find(c => c == currency)) {
  console.log('reset currency field:', currency, get(currencies));
  currency = $selectedMainCurrencySymbol;
 }

 $: console.log('currencies:', $currencies);
 $: console.log('currency:', currency);

 $: updateAmount(amount);
 $: updateFee(fee);

 function updateAmount(amount) {
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
 }

 function updateFee(amount) {
  console.log('fee:', amount);
  try {
   etherValueFee = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
   console.log('etherValueFee:', etherValueFee.toString());
  } catch (e) {
   error = 'Invalid fee';
   console.log('Invalid fee:', e);
   return;
  }
  error = '';
 }

 async function send() {
  console.log('SEND:', address, etherValue, etherValueFee, currency);
  //showSendModal = true;
  //try {
  await sendTransaction(address, etherValue, etherValueFee, currency);
  console.log('Transaction sent successfully');
  showSendModal = true;
  /*} catch (e) {
   console.error('Error sending transaction:', e);
   error = 'Error sending transaction';
  }*/
 }
</script>

<style>
 .send {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .group {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 .group .label {
  padding-left: 3px;
  font-weight: bold;
 }
</style>

<div class="send">
 <div class="group">
  <div class="label">Send to:</div>
  <div class="input"><InputText bind:value={address} /></div>
 </div>
 <div class="group">
  <div class="label">Currency:</div>
  <div class="input"><DropdownFilter options={$currencies} bind:selected={currency} /></div>
 </div>
 <div class="group">
  <div class="label">Amount:</div>
  <div class="input"><InputText bind:value={amount} /></div>
 </div>
 <div class="group">
  <div class="label">Max transaction fee:</div>
  <div class="input"><InputText bind:value={fee} /></div>
  <div class="error">{error}</div>
 </div>
 <Button text="Send" onClick={send} />
</div>
<Modal title="Confirm send" bind:show={showSendModal} body={SendModal} />
