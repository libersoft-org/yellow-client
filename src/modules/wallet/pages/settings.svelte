<script>
 import Section from '../components/settings-section.svelte';
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNewWallet from '../modals/new-wallet.svelte';
 import { selectAddress, addAddress, selectedWallet } from '../wallet.js';
 let section = 'general';
 let isModalPhraseOpen = false;

 selectedWallet.subscribe(value => {
  console.log('sidebar SELECTED WALLET', value);
 });

 function setSection(name) {
  console.log('SET SECTION:', name);
  section = name;
 }

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
 .settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .sections {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ffa;
  border: 1px solid rgb(155, 155, 93);
 }

 .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="settings">
 <div class="sections">
  <Section label="General" active={section === 'general'} on:click={() => setSection('general')} />
  <Section label="Networks" active={section === 'networks'} on:click={() => setSection('networks')} />
  <Section label="Wallets" active={section === 'wallets'} on:click={() => setSection('wallets')} />
 </div>
 {#if section}
  {#if section === 'general'}
   GENERAL
  {/if}
  {#if section === 'networks'}
   NETWORKS
  {/if}
  {#if section === 'wallets'}
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
  {/if}
 {/if}
</div>
{#if isModalPhraseOpen}
 <Modal title="New wallet" onClose={() => isModalPhraseOpen = false}>
  <ModalNewWallet onClose={() => isModalPhraseOpen = false} />
 </Modal>
{/if}
