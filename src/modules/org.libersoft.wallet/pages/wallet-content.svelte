<script>
 import { onMount } from 'svelte';
 import { status, rpcURL, balance, selectedNetwork, selectedAddress, balanceTimestamp } from '../wallet.ts';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNetworks from '../modals/networks.svelte';
 import ModalWallets from '../modals/wallets.svelte';
 import Send from './send.svelte';
 import Receive from './receive.svelte';
 import Balance from './balance.svelte';
 import History from './history.svelte';
 import AddressBook from './addressbook.svelte';
 import Settings from './settings.svelte';
 import Dropdown from '../components/dropdown.svelte';
 import Button from '../../../core/components/button.svelte';
 import { hideSidebarMobile } from '../../../core/core.js';
 let section = 'balance';
 let showModalNetworks = false;
 let showModalWallets = false;
 let addressElement;

 onMount(() => {
  hideSidebarMobile.set(true);
 });

 function clickBackButton() {
  console.log('hideSidebarMobile.set(false)');
  hideSidebarMobile.set(false);
 }

 function setSection(name) {
  section = name;
 }

 selectedNetwork.subscribe(v => {
  console.log('xxselectedNetwork', v);
 });

 selectedAddress.subscribe(v => {
  console.log('xxselectedAddress', v);
 });

 function shortenAddress(addr) {
  if (!addr) return '';
  if (addr.lenght <= 8) return addr;
  return addr.slice(0, 5) + '...' + addr.slice(-3);
 }

 function clickCopyAddress() {
  navigator.clipboard
   .writeText($selectedAddress.address)
   .then(() => console.log('Address copied to clipboard'))
   .catch(err => console.error('Error while copying to clipboard', err));
  addressElement.innerHTML = 'Copied!';
  setTimeout(() => (addressElement.innerHTML = shortenAddress($selectedAddress.address)), 1000);
 }
</script>

<style>
 .wallet-content {
  background: url('/img/background.webp') repeat;
  background-size: 400px;
  height: 100vh;
 }

 .top-bar {
  display: flex;
  align-items: center;
  width: calc(100% - 20px);
  height: 52px;
  padding: 10px;
  background-color: #222;
 }

 .top-bar .left {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 10px;
 }

 .top-bar .left .button {
  padding: 5px;
  width: 30px;
  height: 30px;
 }

 .top-bar .right {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: end;
 }

 .wallet {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 72px);
  overflow: auto;
 }

 .wallet .content {
  max-width: calc(100% - 10px);
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

 .body .top .left,
 .body .top .center,
 .body .top .right {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 25px;
  font-weight: bold;
 }

 .body .top .center .balance .crypto img {
  display: block;
  width: 50px;
  height: 50px;
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
 }

 .body .top .right .address .copy {
  width: 15px;
  height: 15px;
 }

 .body .buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
 }

 .body .separator {
  width: 100%;
  border-bottom: 1px solid #888;
 }

 @media (min-width: 769px) {
  .top-bar .left .button {
   display: none;
  }
 }
</style>

<div class="wallet-content">
 <div class="top-bar">
  <div class="left">
   <BaseButton onClick={clickBackButton}>
    <div class="button">
     <img src="img/back-white.svg" alt="Back" />
    </div>
   </BaseButton>
   <Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} onClick={() => (showModalNetworks = true)} />
  </div>
  <div class="right">
   <Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} onClick={() => (showModalWallets = true)} />
  </div>
 </div>
 <div class="wallet">
  <div class="content">
   <div class="body">
    <div class="top">
     <div class="left">
      <div class="status">
       <div class="indicator {$status.color}"></div>
       <div>{$status.text}</div>
      </div>
      <div style="font-size: 12px">Server: {$rpcURL}</div>
     </div>
     <div class="center">
      <div class="balance">
       <div class="crypto">
        {#if $selectedNetwork?.currency?.iconURL}
         <div><img src={$selectedNetwork.currency.iconURL} alt={$balance.crypto.currency} /></div>
        {/if}
        <div>{$balance.crypto.amount} {$balance.crypto.currency}</div>
       </div>
       <div class="fiat">({$balance.fiat.amount} {$balance.fiat.currency})</div>
       <pre>retrieved {$balanceTimestamp}</pre>
      </div>
     </div>
     <div class="right">
      {#if $selectedAddress && $selectedAddress.address}
       <BaseButton onClick={clickCopyAddress}>
        <div class="address">
         <div bind:this={addressElement}>{shortenAddress($selectedAddress.address)}</div>
         <div class="copy"><img src="img/copy.svg" alt="Copy" /></div>
        </div>
       </BaseButton>
      {:else}
       <div class="address">No address selected</div>
      {/if}
     </div>
    </div>
    <div class="buttons">
     <Button width="70px" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('send')} />
     <Button width="70px" text="Receive" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('receive')} />
     <Button width="70px" text="Balance" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('balance')} />
     <Button width="70px" text="History" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('history')} />
     <Button width="70px" text="Address book" onClick={() => setSection('addressbook')} />
     <Button width="70px" text="Settings" onClick={() => setSection('settings')} />
    </div>
    <div class="separator"></div>
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
</div>
<Modal title="Select your network" body={ModalNetworks} bind:show={showModalNetworks} />
<Modal title="Select your address" body={ModalWallets} bind:show={showModalWallets} />
