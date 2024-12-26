<script>
 import { selectedNetwork, selectedAddress } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 let info = '';
 let link = '';

 $: link = $selectedNetwork.explorerURL + '/address/' + $selectedAddress.address;

 function copyLink() {
  navigator.clipboard
   .writeText(link)
   .then(() => console.log('Address copied to clipboard'))
   .catch(err => console.error('Error while copying to clipboard', err));
  setInfo('Copied!');
  setTimeout(() => hideInfo(), 1000);
 }

 function openLink() {
  window.open(link, '_blank');
 }

 function setInfo(text) {
  info.classList.remove('hidden');
  info.innerHTML = text;
 }

 function hideInfo() {
  info.classList.add('hidden');
 }
</script>

<style>
 .history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
 }

 .url {
  padding: 10px;
  border: 1px solid #b90;
  border-radius: 10px;
  background-color: #ffa;
 }

 .buttons {
  display: flex;
  gap: 10px;
 }

 .info {
  padding: 10px;
  border: 1px solid #080;
  border-radius: 10px;
  background-color: #cfc;
 }

 .info.hidden {
  display: none;
 }
</style>

<div class="history">
 {#if $selectedNetwork && $selectedAddress}
  <div class="bold">Address history:</div>
  <div class="url">
   {link}
  </div>
  <div class="info hidden" bind:this={info}></div>
  <div class="buttons">
   <Button text="Copy link" onClick={copyLink} />
   <Button text="Open link" onClick={openLink} />
  </div>
 {:else}
  <div>No network or wallet selected</div>
 {/if}
</div>
