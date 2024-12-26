<script>
 import { wallets, addAddress, addWallet, walletAddresses } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 import Icon from '../../../core/components/icon.svelte';
 import Accordion from '../../../core/components/accordion.svelte';
 import Address from '../components/settings-wallets-address.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNewWallet from '../modals/new-wallet.svelte';
 import { Mnemonic } from 'ethers';

 let showModalPhrase = false;
 let activeIndex = null;

 function showNewWalletModal() {
  showModalPhrase = true;
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

<style>
 table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 tr.even {
  background-color: #ffa;
 }

 tr.odd {
  background-color: #ffd;
 }

 tr:hover {
  background-color: #fd1;
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

 .icons {
  display: flex;
 }

 .buttons {
  display: flex;
  gap: 10px;
 }

 .wallet {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }
</style>

<div class="buttons">
 <Button width="80px" text="Create wallet" onClick={showNewWalletModal} />
 <Button width="80px" text="Recover" onClick={recover} />
</div>
<Accordion items={$wallets} let:prop={wallet} bind:activeIndex>
 <div class="wallet">
  <div class="buttons">
   <Button text="Add a new address" onClick={() => addAddress(wallet)} />
   <Button text="Add a new address (by index)" onClick={() => addAddressWithIndex(wallet)} />
  </div>
  <table>
   <thead>
    <tr>
     <th class="center">Index</th>
     <th>Alias</th>
     <th>Address</th>
     <th class="center">Action</th>
    </tr>
   </thead>
   <tbody>
    {#each walletAddresses(wallet) as address, index}
     <tr class={index % 2 === 0 ? 'even' : 'odd'}>
      <td class="center">{address.index}</td>
      <td>{address.name}</td>
      <td><Address address={address.address} /></td>
      <td class="icons">
       <Icon img="img/edit.svg" alt="Rename" size="20" padding="5" onClick={() => renameAddress(wallet, address)} />
       <Icon img="modules/org.libersoft.wallet/img/hide.svg" alt="Hide" size="20" padding="5" onClick={() => deleteAddress(wallet, address)} />
      </td>
     </tr>
    {/each}
   </tbody>
  </table>
 </div>
</Accordion>

<Modal title="New wallet" body={ModalNewWallet} bind:show={showModalPhrase} />
