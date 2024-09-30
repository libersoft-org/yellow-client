<script>
 import { onMount } from 'svelte';
 import { balance, getBalance, setNetwork, createWallet, selectedNetwork, selectedWallet } from '../wallet.js';
 import Modal from '../../../core/components/modal.svelte';
 import ModalPhrase from '../modals/phrase.svelte';
 import ModalNetworks from '../modals/networks.svelte';
 import ModalWallets from '../modals/wallets.svelte';
 import Send from './send.svelte';
 import Receive from './receive.svelte';
 import Balance from './balance.svelte';
 import History from './history.svelte';
 import Settings from './settings.svelte';
 import Dropdown from "../components/dropdown.svelte";
 import Button from '../../../core/components/button.svelte';
 let section = 'balance';
 let isModalPhraseOpen = false;
 let isModalNetworksOpen = false;
 let isModalWalletsOpen = false;
 let newPhrase = '';

 onMount(() => {
  // TODO: set the last used network and wallet or the first one in these lists (if exist)
 });

 function setSection(name) {
  section = name;
 }

 function onSetNetwork() {
  setNetwork();
  getBalance();
 }

 function onSetWallet() {
  getBalance();
 }

 function shortenAddress(addr) {
  if (!addr) return '';
  if (addr.lenght <= 8) return addr;
  return addr.slice(0, 5) + '...' + addr.slice(-3);
 }

 async function showNewWalletModal() {
  newPhrase = await createWallet();
  isModalPhraseOpen = true;
  console.log('PHRASE:', newPhrase);
 }

 function clickCopyAddress() {
  navigator.clipboard.writeText($selectedNetwork.address)
  .then(() => console.log('Address coppied to clipboard'))
  .catch(err => console.error('Error while copying to clipboard', err));
 }

 function keyCopyAddress() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCopyAddress();
  }
 }
</script>

<style>
 .wallet {
  display: flex;
  justify-content: center;
  padding: 10px;
  height: calc(100vh - 20px);
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .wallet .content {
  width: 768px;
  max-width: calc(100% - 10px);
  overflow: auto;
  border: 1px solid #000;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: var(--shadow);
 }

 .header {
  display: flex;
  padding: 10px;
  background-color: #fd1;
 }

 .header .left {
  flex: 1;
 }

 .header .right {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: end;
 }

 .header .right .address {
  display: flex;
  align-items: center;
  gap: 5px;
 }

 .header .right .address .copy {
  width: 20px;
  height: 20px;
  padding: 5px;
  cursor: pointer;
 }

 .body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .body .balance {
  display: flex;
  flex-direction: column;
  align-items: center;
 }

 .body .balance .crypto {
  font-size: 25px;
  font-weight: bold;
 }

 .body .balance .fiat {
  font-size: 18px;
  color: #555;
 }

 .body .buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
 }
</style>

<div class="wallet">
 <div class="content">
  <div class="header">
   <div class="left">
    <Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} onClick={() => isModalNetworksOpen = true} onClose={() => isModalNetworksOpen = true} />
   </div>
   <div class="right">
    <Dropdown text={$selectedWallet ? $selectedWallet.name : '--- Select your wallet ---'} onClick={() => isModalWalletsOpen = true} onClose={() => isModalWalletsOpen = true} />
    {#if $selectedWallet && $selectedWallet.address}
     <div class="address">
      <div>{shortenAddress($selectedWallet.address)}</div>
      <div class="copy" role="button" tabindex="0" on:click={clickCopyAddress} on:keydown={keyCopyAddress}><img src="img/copy.svg" alt="Copy" /></div>
     </div>
    {/if}
   </div>
  </div>
  <div class="body">
   <div class="balance">
    <div class="crypto">{$balance.crypto.amount} {$balance.crypto.currency}</div>
    <div class="fiat">({$balance.fiat.amount} {$balance.fiat.currency})</div>
   </div>
   <div class="buttons">
    <Button width="80px" text="Send" on:click={() => setSection('send')} />
    <Button width="80px" text="Receive" on:click={() => setSection('receive')} />
    <Button width="80px" text="Balance" on:click={() => setSection('balance')} />
    <Button width="80px" text="History" on:click={() => setSection('history')}  />
    <Button width="80px" text="Settings" on:click={() => setSection('settings')}  />
    <Button width="80px" text="Create wallet" on:click={showNewWalletModal}  />
   </div>
   <div class="section">
    {#if section == 'send'}
     <Send />
    {:else if section == 'receive'}
     <Receive />
    {:else if section == 'balance'}
     <Balance />
    {:else if section == 'history'}
     <History />
    {:else if section == 'settings'}
     <Settings />
    {/if}
   </div>
  </div>
 </div>
</div>
{#if isModalPhraseOpen}
 <Modal title="New wallet" onClose={() => isModalPhraseOpen = false}>
  <ModalPhrase phrase={newPhrase} onClose={() => isModalPhraseOpen = false} />
 </Modal>
{/if}
{#if isModalNetworksOpen}
 <Modal title="Select your network" onClose={() => isModalNetworksOpen = false}>
  <ModalNetworks phrase={newPhrase} onClose={() => isModalNetworksOpen = false} {onSetNetwork} />
 </Modal>
{/if}
{#if isModalWalletsOpen}
 <Modal title="Select your wallet" onClose={() => isModalWalletsOpen = false}>
  <ModalWallets phrase={newPhrase} onClose={() => isModalWalletsOpen = false} {onSetWallet} />
 </Modal>
{/if}
