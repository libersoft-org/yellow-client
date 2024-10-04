<script>
 import { onMount } from 'svelte';
 import { status, rpcURL, balance, selectedNetwork, selectedAddress, balanceTimestamp } from '../wallet.js';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNetworks from '../modals/networks.svelte';
 import ModalWallets from '../modals/wallets.svelte';
 import Send from './send.svelte';
 import Receive from './receive.svelte';
 import Balance from './balance.svelte';
 import AddressBook from './addressbook.svelte';
 import Settings from './settings.svelte';
 import Dropdown from "../components/dropdown.svelte";
 import Button from '../../../core/components/button.svelte';
 let section = 'balance';
 let isModalNetworksOpen = false;
 let isModalWalletsOpen = false;
 let addressElement;

 onMount(() => {
  // TODO: set the last used network and wallet or the first one in these lists (if exist)
 });

 function setSection(name) {
  section = name;
 }

 function shortenAddress(addr) {
  if (!addr) return '';
  if (addr.lenght <= 8) return addr;
  return addr.slice(0, 5) + '...' + addr.slice(-3);
 }

 function clickCopyAddress() {
  navigator.clipboard.writeText($selectedAddress.address)
  .then(() => console.log('Address coppied to clipboard'))
  .catch(err => console.error('Error while copying to clipboard', err));
  addressElement.innerHTML = ('Copied!');
  setTimeout(() => addressElement.innerHTML = shortenAddress($selectedAddress.address), 1000);
 }

 function keyCopyAddress() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCopyAddress();
  }
 }

 function getTransactionHistory() {
  window.open($selectedNetwork.explorerURL + '/address/' + $selectedAddress.address, '_blank');
 }
</script>

<style>
 .wallet {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .wallet .top-bar {
  display: flex;
  align-items: center;
  width: calc(100% - 20px);
  height: 52px;
  padding: 10px;
  background-color: #222;
 }

 .wallet .top-bar .left {
  display: flex;
  flex-direction: column;
  align-items: start;
  flex: 1;
 }

 .wallet .top-bar .right {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: end;
 }

 .wallet .content {
  width: 768px;
  max-width: calc(100% - 10px);
  overflow: auto;
  margin: 10px;
  border: 1px solid #000;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: var(--shadow);
 }

 .body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
 }

 .body .top {
  display: flex;
  width: 100%;
 }

 .body .top .left, .body .top .center, .body .top .right {
  flex: 1;
 }

 .body .top .left .status {
  vertical-align: bottom;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 20px;
 }

 .body .top .left .status .indicator {
  border-radius: 50%;
  min-width: 10px;
  min-height: 10px;
  border: 1px solid #000;
 }

 .body .top .left .status .indicator.red {
  background-color: #a00;
 }

 .body .top .left .status .indicator.orange {
  background-color: #f80;
 }

 .body .top .left .status .indicator.green {
  background-color: #0a0;
 }

 .body .top .center .balance {
  display: flex;
  flex-direction: column;
  align-items: center;
 }

 .body .top .center .balance .crypto {
  font-size: 25px;
  font-weight: bold;
 }

 .body .top .center .balance .fiat {
  font-size: 18px;
  color: #555;
 }

 .body .top .right .address {
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 5px;
  cursor: pointer;
 }

 .body .top .right .address .copy {
  width: 15px;
  height: 15px;
 }

 .body .buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
 }
</style>

<div class="wallet">
 <div class="top-bar">
  <div class="left">
   <Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} onClick={() => isModalNetworksOpen = true} onClose={() => isModalNetworksOpen = true} />
  </div>
  <div class="right">
   <Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your wallet ---'} onClick={() => isModalWalletsOpen = true} onClose={() => isModalWalletsOpen = true} />
  </div>
 </div>
 <div class="content">
  <div class="body">
   <div class="top">
    <div class="left">
     <div class="status">
      <div class="indicator orange"></div>
      <div>{$status} </div>
      <div><pre>{$rpcURL}</pre> </div>
     </div>
    </div>
    <div class="center">
     <div class="balance">
      <div class="crypto">{$balance.crypto.amount} {$balance.crypto.currency}</div>
      <div class="fiat">({$balance.fiat.amount} {$balance.fiat.currency})</div>
      <div>retrieved {$balanceTimestamp}</div>
     </div>
    </div>
    <div class="right">
     {#if $selectedAddress && $selectedAddress.address}
      <div class="address" role="button" tabindex="0" on:click={clickCopyAddress} on:keydown={keyCopyAddress}>
       <div bind:this={addressElement}>{shortenAddress($selectedAddress.address)}</div>
       <div class="copy"><img src="img/copy.svg" alt="Copy" /></div>
      </div>
     {:else}
      <div class="address">No wallet selected</div>
     {/if}
    </div>
   </div>
   <div class="buttons">
    <Button width="80px" text="Send" on:click={() => setSection('send')} />
    <Button width="80px" text="Receive" on:click={() => setSection('receive')} />
    <Button width="80px" text="Balance" on:click={() => setSection('balance')} />
    <Button width="80px" text="History" on:click={getTransactionHistory}  />
    <Button width="80px" text="Address book" on:click={() => setSection('addressbook')}  />
    <Button width="80px" text="Settings" on:click={() => setSection('settings')}  />
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
    {:else if section == 'addressbook'}
     <AddressBook />
    {:else if section == 'settings'}
     <Settings />
    {/if}
   </div>
  </div>
 </div>
</div>
{#if isModalNetworksOpen}
 <Modal title="Select your network" onClose={() => isModalNetworksOpen = false}>
  <ModalNetworks onClose={() => isModalNetworksOpen = false} />
 </Modal>
{/if}
{#if isModalWalletsOpen}
 <Modal title="Select your wallet" onClose={() => isModalWalletsOpen = false}>
  <ModalWallets onClose={() => isModalWalletsOpen = false} />
 </Modal>
{/if}
