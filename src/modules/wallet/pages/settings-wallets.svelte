<script>
 import { wallets, addAddress, selectAddress, addWallet, walletAddresses } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 import Accordion from '../../../core/components/accordion.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNewWallet from '../modals/new-wallet.svelte';
 import { Mnemonic } from 'ethers';

 let isModalPhraseOpen = false;
 let activeIndex = null;

 function showNewWalletModal() {
  isModalPhraseOpen = true;
 }

 function afterAddWallet() {
  activeIndex = wallets.length - 1;
 }

 function recover() {
  let phrase = window.prompt('Enter your recovery phrase');
  if (!phrase) return;
  let mn = Mnemonic.fromPhrase(phrase);
  addWallet(mn, ' - recovered');
  afterAddWallet();
 }
 function addAddressWithIndex(wallet) {
  let index = window.prompt('Enter the index');
  if (!index) return;
  addAddress(wallet, index);
 }

 function renameAddress(wallet, address) {
  let name = window.prompt('Enter the new name');
  if (!name) return;
  address.name = name;
  wallets.update(v => v);
 }

 function deleteAddress(wallet, address) {
  address.deleted = true;
  wallets.update(v => v);
 }
</script>

<div class="buttons">
 <Button width="80px" text="Create wallet" on:click={showNewWalletModal} />
 <Button width="80px" text="Recover" on:click={recover} />
</div>
<Accordion items={$wallets} let:prop={wallet} bind:activeIndex>
 <div>
  <Button text="Generate new address" on:click={() => addAddress(wallet)} />
  <Button text="Generate new address (with index)" on:click={() => addAddressWithIndex(wallet)} />
  <table>
   <tr>
    <th>Alias</th>
    <th>Address</th>
    <th class="center">Action</th>
   </tr>
   {#each walletAddresses(wallet) as address (address.index)}
    <tr>
     <td class="address-name">{address.name}</td>
     <td class="address-value">{address.address}</td>
     <td><Button text="Select" on:click={() => selectAddress(wallet, address)} /></td>
     <td><Button text="Rename" on:click={() => renameAddress(wallet, address)} /></td>
     <td><Button text="Hide" on:click={() => deleteAddress(wallet, address)} /></td>
    </tr>
   {/each}
  </table>
 </div>
</Accordion>
{#if isModalPhraseOpen}
 <Modal title="New wallet" onClose={() => (isModalPhraseOpen = false)}>
  <ModalNewWallet
   onClose={() => {
    isModalPhraseOpen = false;
    afterAddWallet();
   }}
  />
 </Modal>
{/if}

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
