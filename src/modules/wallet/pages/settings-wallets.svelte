<script>
 import { selectAddress, addAddress, selectedWallet } from '../wallet.js';
 import Button from '../../../core/components/button.svelte';

 selectedWallet.subscribe(value => {
  console.log('sidebar SELECTED WALLET', value);
 });

 function showNewWalletModal() {
  isModalPhraseOpen = true;
 }

 function recover() {
  let phrase = window.prompt('Enter your recovery phrase');
  if (!phrase) return;
  addWallet(phrase, ' - recovered');
 }
</script>

<style>
 .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="buttons">
 <Button width="80px" text="Create wallet" on:click={showNewWalletModal}  />
 <Button width="80px" text="Recover" on:click={recover}  />
</div>
{#if $selectedWallet}
 <Button text="Generate new address" on:click={addAddress} />
 <table>
  <tr>
   <th>Alias</th>
   <th>Address</th>
   <th>Action</th>
  </tr>
  {#each $selectedWallet?.addresses || [] as address (address.index)}
   <tr>
    <td class="address-name">{address.name}</td>
    <td class="address-value">{address.address}</td>
    <td><Button text="Select" on:click={selectAddress} /></td>
   </tr>
  {/each}
 </table>
{/if}
