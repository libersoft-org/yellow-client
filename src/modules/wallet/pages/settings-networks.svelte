<script>
 import { default_networks } from '../networks.js';
 import { addNetwork, removeNetwork, networks } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 import Icon from '../components/table-icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalEditNetwork from '../modals/edit-network.svelte';
 import ModalTokenList from '../modals/token-list.svelte';

 let isModalEditNetworkOpen = false;
 let isModalTokenListOpen = false;
 let modalEditNetworkItem = null;

 function editNetwork(net) {
  console.log('editNetwork', net);
  isModalEditNetworkOpen = true;
  modalEditNetworkItem = net;
 }

 function tokenList(net) {
  console.log('tokenList', net);
  isModalTokenListOpen = true;
  modalEditNetworkItem = net;
 }
</script>

<style>
 .networks {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .items {
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .items .item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
 }

 .items .item.even {
  background-color: #ffa;
 }

 .items .item.odd {
  background-color: #ffd;
 }

 .items .item:hover {
  background-color: #fd1;
 }

 .items .item img {
  width: 20px;
  height: 20px;
 }

 .items .item .name {
  flex-grow: 1;
 }

 .buttons {
  display: flex;
  gap: 5px;
 }
</style>

<div class="networks">
 <div class="bold">My networks:</div>
 <div class="items">
  {#each $networks as n, index}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    {#if n.currency?.iconURL}
     <img src={n.currency.iconURL} alt="" />
    {/if}
    <div class="name">{n.name}</div>
    <div class="buttons">
     <Icon icon="img/coin.svg" title="Token list" on:click={() => tokenList(n)} />
     <Icon icon="img/edit.svg" title="Edit network" on:click={() => editNetwork(n)} />
     <Icon icon="img/del.svg" title="Delete network" on:click={() => removeNetwork(n)} />
    </div>
   </div>
  {/each}
 </div>

 <div class="bold">Default networks:</div>
 <div class="items">
  {#each $default_networks as n, index}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    {#if n.currency?.iconURL}
     <img src={n.currency.iconURL} alt="" />
    {/if}
    <div class="name">{n.name}</div>
    <Icon icon="img/add-black.svg" title="Add to my networks" on:click={() => addNetwork(n)} />
   </div>
  {/each}
 </div>
</div>
{#if isModalEditNetworkOpen}
 <Modal title="Edit network" onClose={() => (isModalEditNetworkOpen = false)}>
  <ModalEditNetwork item={modalEditNetworkItem} onClose={() => (isModalEditNetworkOpen = false)} />
 </Modal>
{/if}
{#if isModalTokenListOpen}
 <Modal title="Token list" onClose={() => (isModalTokenListOpen = false)}>
  <ModalTokenList item={modalEditNetworkItem} onClose={() => (isModalTokenListOpen = false)} />
 </Modal>
{/if}
