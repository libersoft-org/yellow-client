<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
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
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100px;
 }
</style>

<BaseButton onClick={clickCopyAddress}>
 <div class="address">
  <div bind:this={elemAddress}>{address}</div>
  <Icon img="img/copy.svg" alt="Copy" colorVariable="--icon-black" size="15px" padding="0px" />
 </div>
</BaseButton>
