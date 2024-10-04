<script>
 import { selectAddress, addAddress, selectedWallet } from '../wallet.js';
 import Button from '../../../core/components/button.svelte';
 import Accordion from '../../../core/components/accordion.svelte';

 let wallets = [{
  title: 'My wallet 1',
  content: 'My address 1'
 }, {
  title: 'My wallet 2',
  content: 'My address 2'
 }];

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
 table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 th {
  padding: 5px;
  text-align: left;
  background-color: #222;
  color: #fff;
 }

 th.center {
  text-align: center;
 }

 td {
  padding: 5px;
 }

 .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="buttons">
 <Button width="80px" text="Create wallet" on:click={showNewWalletModal}  />
 <Button width="80px" text="Recover" on:click={recover}  />
</div>
<Accordion items={wallets} />
{#if $selectedWallet}
 <Button text="Generate new address" on:click={addAddress} />
 <table>
  <tr>
   <th>Alias</th>
   <th>Address</th>
   <th class="center">Action</th>
  </tr>
  {#each $selectedWallet?.addresses || [] as address (address.index)}
   <tr>
    <td class="address-name">{address.name}</td>
    <td class="address-value">{address.address}</td>
    <td><Button text="Select" on:click={() => selectAddress($selectedWallet, address.address) } /></td>
   </tr>
  {/each}
 </table>
{/if}
