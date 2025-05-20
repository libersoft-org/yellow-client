<script>
 import { onMount } from 'svelte';
 import { module } from '../module.js';
 import { status, rpcURL, balance, selectedNetwork, selectedAddress, balanceTimestamp } from '../wallet.ts';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import Modal from '@/core/components/Modal/Modal.svelte';
 import ModalNetworks from '../modals/networks.svelte';
 import ModalWallets from '../modals/wallets.svelte';
 import ModalSettings from '../modals/Settings/Settings.svelte';
 import Send from './send.svelte';
 import Receive from './receive.svelte';
 import Balance from './balance.svelte';
 import History from './history.svelte';
 import Dropdown from '../components/dropdown.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import { hideSidebarMobile } from '@/core/core.js';
 let section = 'balance';
 let showModalNetworks = false;
 let showModalWallets = false;
 let showModalSettings = false;
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
  .top-bar .left .back-button {
   display: none;
  }
 }
</style>

<div class="wallet-content">
 <div class="top-bar">
  <div class="left">
   <div class="back-button">
    <Icon img="img/back.svg" alt="Back" colorVariable="--icon-white" size="30px" padding="0px" onClick={clickBackButton} />
   </div>
   <Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} colorVariable="--icon-black" onClick={() => (showModalNetworks = true)} />
  </div>
  <div class="right">
   <Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} colorVariable="--icon-black" onClick={() => (showModalWallets = true)} />
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
         <Icon img="img/copy.svg" alt="Copy" colorVariable="--icon-black" size="15px" padding="0px" />
        </div>
       </BaseButton>
      {:else}
       <div class="address">No address selected</div>
      {/if}
     </div>
    </div>
    <div class="buttons">
     <Button img="modules/{module.identifier}/img/send.svg" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('send')} />
     <Button img="modules/{module.identifier}/img/receive.svg" text="Receive" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('receive')} />
     <Button img="modules/{module.identifier}/img/balance.svg" text="Balance" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('balance')} />
     <Button img="modules/{module.identifier}/img/history.svg" text="History" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('history')} />
     <Button img="img/settings.svg" text="Settings" onClick={() => (showModalSettings = true)} />
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
<Modal title="Wallet settings" width="500px" body={ModalSettings} bind:show={showModalSettings} />
