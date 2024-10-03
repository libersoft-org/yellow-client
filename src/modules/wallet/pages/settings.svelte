<script>
 import Section from '../components/settings-section.svelte';
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNewWallet from '../modals/new-wallet.svelte';
 let section = 'general';
 let isModalPhraseOpen = false;

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
  saveWallet(phrase, ' - recovered');
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
   <div class="buttons">
    <Button width="80px" text="Create wallet" on:click={showNewWalletModal}  />
    <Button width="80px" text="Recover" on:click={recover}  />
   </div>
  {/if}
  {#if section === 'wallets'}
   WALLETS
  {/if}
 {/if}
</div>
{#if isModalPhraseOpen}
 <Modal title="New wallet" onClose={() => isModalPhraseOpen = false}>
  <ModalNewWallet onClose={() => isModalPhraseOpen = false} />
 </Modal>
{/if}
