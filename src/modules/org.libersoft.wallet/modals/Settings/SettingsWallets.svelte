<script>
 import { module } from '../../module.js';
 import { wallets, addAddress, addWallet, walletAddresses } from '../../wallet.ts';
 import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import Table from '@/core/components/Table/Table.svelte';
 import Thead from '@/core/components/Table/TableThead.svelte';
 import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
 import Th from '@/core/components/Table/TableTheadTh.svelte';
 import Tbody from '@/core/components/Table/TableTbody.svelte';
 import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
 import Td from '@/core/components/Table/TableTbodyTd.svelte';
 import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import Accordion from '@/core/components/Accordion/Accordion.svelte';
 import Address from '../../components/settings-wallets-address.svelte';
 import Modal from '@/core/components/Modal/Modal.svelte';
 import ModalNewWallet from '../../modals/new-wallet.svelte';
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
 .wallet {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }
</style>

<ButtonBar>
 <Button width="80px" text="Create wallet" onClick={showNewWalletModal} />
 <Button width="80px" img="modules/{module.identifier}/img/recover.svg" text="Recover" onClick={recover} />
</ButtonBar>
{#if $wallets.length > 0}
 <div class="bold">My wallets:</div>
{/if}
{#if $wallets.length === 0}
 <div class="bold">No wallets found</div>
{/if}
<Accordion items={$wallets} let:prop={wallet} bind:activeIndex>
 <div class="wallet">
  <ButtonBar>
   <Button text="Add a new address" onClick={() => addAddress(wallet)} />
   <Button text="Add a new address (by index)" onClick={() => addAddressWithIndex(wallet)} />
  </ButtonBar>
  <Table>
   <Thead>
    <TheadTr>
     <Th center={true}>Index</Th>
     <Th>Alias</Th>
     <Th>Address</Th>
     <Th center={true}>Action</Th>
    </TheadTr>
   </Thead>
   <Tbody>
    {#each walletAddresses(wallet) as address, index}
     <TbodyTr>
      <Td center={true}>{address.index}</Td>
      <Td>{address.name}</Td>
      <Td><Address address={address.address} /></Td>
      <Td>
       <TableActionItems>
        <Icon img="img/edit.svg" alt="Rename" colorVariable="--icon-blue" size="20px" padding="5px" onClick={() => renameAddress(wallet, address)} />
        <Icon img="modules/{module.identifier}/img/hide.svg" alt="Hide" colorVariable="--icon-black" size="20px" padding="5px" onClick={() => deleteAddress(wallet, address)} />
       </TableActionItems>
      </Td>
     </TbodyTr>
    {/each}
   </Tbody>
  </Table>
 </div>
</Accordion>
<Modal title="New wallet" body={ModalNewWallet} bind:show={showModalPhrase} />
