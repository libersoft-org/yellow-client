<script>
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

 function keyCopyAddress() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCopyAddress();
  }
 }
</script>

<style>
 .address {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
 }

 .address img {
  width: 15px;
  height: 15px;
 }
</style>

<div class="address" role="button" tabindex="0" on:click={clickCopyAddress} on:keydown={keyCopyAddress}>
 <div bind:this={elemAddress}>{address}</div>
 <img src="img/copy.svg" alt="Copy" />
</div>
