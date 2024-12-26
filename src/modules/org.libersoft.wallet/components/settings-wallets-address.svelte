<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let address;
 let elemAddress;

 function clickCopyAddress() {
  console.log('COPY', address, elemAddress);
  navigator.clipboard
   .writeText(address)
   .then(() => console.log('Address copied to clipboard'))
   .catch(err => console.error('Error while copying to clipboard', err));
  elemAddress.innerHTML = 'Copied!';
  setTimeout(() => (elemAddress.innerHTML = address), 1000);
 }
</script>

<style>
 .address {
  display: flex;
  align-items: center;
  gap: 5px;
 }

 .address img {
  width: 15px;
  height: 15px;
 }
</style>

<BaseButton onClick={clickCopyAddress}>
 <div class="address">
  <div bind:this={elemAddress}>{address}</div>
  <img src="img/copy.svg" alt="Copy" />
 </div>
</BaseButton>
