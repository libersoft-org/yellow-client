<script>
 import { onMount } from 'svelte';
 import Wallet from '../wallet.js';
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

 onMount(() => {
  walletsData = Wallet.wallets.map(item => ({ id: item.id, text: item.name }));
  networksData = Wallet.networks.map(item => ({ id: item.id, text: item.name }));
 });

 function setSection(name) {
  section = name;
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
    <div>{Wallet.address}</div>
   </div>
   <div class="right">
    Right
   </div>
  </div>
  <div class="body">
   <div class="balance">
    <div class="crypto">{Wallet.balance.crypto}</div>
    <div class="fiat">({Wallet.balance.fiat})</div>
   </div>
   <div class="buttons">
    <Button text="Send" on:click={() => setSection('send')} />
    <Button text="Receive" on:click={() => setSection('receive')} />
    <Button text="Balance" on:click={() => setSection('balance')} />
    <Button text="History" on:click={() => setSection('history')}  />
    <Button text="Settings" on:click={() => setSection('settings')}  />
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
