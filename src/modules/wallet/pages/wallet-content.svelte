<script>
 import { onMount } from 'svelte';
 import { get } from 'svelte/store';
 import { wallets, networks, address, balance, createWallet } from '../wallet.js';
 import Modal from '../../../core/components/modal.svelte';
 import ModalPhrase from '../modals/phrase.svelte';
 import Send from './send.svelte';
 import Receive from './receive.svelte';
 import Balance from './balance.svelte';
 import History from './history.svelte';
 import Settings from './settings.svelte';
 import Dropdown from "../components/dropdown.svelte";
 import Button from '../../../core/components/button.svelte';
 let section = 'balance';
 let walletsData = [];
 let networksData = [];
 let isModalPhraseOpen = false;
 let newPhrase = '';

 onMount(() => {
  walletsData = get(wallets).map(item => ({ id: item.id, text: item.name }));
  networksData = get(networks).map(item => ({ id: item.id, text: item.name }));
 });

 function setSection(name) {
  section = name;
 }

 function showNewWalletModal() {
  newPhrase = createWallet();
  isModalPhraseOpen = true;
  console.log('PHRASE:', newPhrase);
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

 .wallet .content .header {
  display: flex;
  padding: 10px;
  background-color: #fd1;
 }

 .wallet .content .header .left {
  flex: 1;
  background-color: red;
 }

 .wallet .content .header .center {
  flex: 1;
  text-align: center;
  background-color: orange;
 }

 .wallet .content .header .right {
  flex: 1;
  text-align: right;
  background-color: green;
 }

 .wallet .content .body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .wallet .content .body .balance {
  display: flex;
  flex-direction: column;
  align-items: center;

 }

 .wallet .content .body .balance .crypto {
  font-size: 25px;
  font-weight: bold;
 }

 .wallet .content .body .balance .fiat {
  font-size: 18px;
  color: #555;
 }

 .wallet .content .body .buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
 }
</style>

<div class="wallet">
 <div class="content">
  <div class="header">
   <div class="left">
    <Dropdown items={networksData} />
   </div>
   <div class="center">
    <div><Dropdown items={walletsData} /></div>
    <div>{$address}</div>
   </div>
   <div class="right">
    Right
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
