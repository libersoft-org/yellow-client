<script>
 import { wallets, addAddress, selectAddress } from '../wallet.js';
 import Button from '../../../core/components/button.svelte';
 import Accordion from '../../../core/components/accordion.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNewWallet from '../modals/new-wallet.svelte';

 let isModalPhraseOpen = false;

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
<Accordion items={$wallets} let:prop={wallet} >
 <div>
  <Button text="Generate new address" on:click={() => addAddress(wallet)} />
  <table>
   <tr>
    <th>Alias</th>
    <th>Address</th>
    <th class="center">Action</th>
   </tr>
   {#each wallet.addresses || [] as address (address.index)}
    <tr>
     <td class="address-name">{address.name}</td>
     <td class="address-value">{address.address}</td>
     <td><Button text="Select" on:click={() => selectAddress(wallet, address) } /></td>
    </tr>
   {/each}
  </table>
 </div>
</Accordion>
{#if isModalPhraseOpen}
 <Modal title="New wallet" onClose={() => isModalPhraseOpen = false}>
  <ModalNewWallet onClose={() => isModalPhraseOpen = false} />
 </Modal>
{/if}

