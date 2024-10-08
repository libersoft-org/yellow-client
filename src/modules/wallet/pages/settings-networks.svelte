<script>
 import { default_networks } from '../networks.js';
 import { addNetwork, removeNetwork, networks } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalEditNetwork from '../modals/edit-network.svelte';

 let isModalEditNetworkOpen = false;
 let modalEditNetworkItem = null;

 export function editNetwork(net) {
  console.log('editNetwork', net);
  isModalEditNetworkOpen = true;
  modalEditNetworkItem = net;
 }
</script>

<style>
 .items {
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .items .item {
  display: flex;
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
</style>

<div class="networks">
 my networks:
 <div class="items">
  {#each $networks as n, index}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    {#if n.currency?.iconURL}
     <img src={n.currency.iconURL} alt="" />
    {/if}
    <div>{n.name}</div>
   </div>
   <Button on:click={() => editNetwork(n)}>Edit network</Button>
   <Button on:click={() => removeNetwork(n)}>Remove network</Button>
  {/each}
 </div>

 default networks:
 <div class="items">
  {#each $default_networks as n, index}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    {#if n.currency?.iconURL}
     <img src={n.currency.iconURL} alt="" />
    {/if}
    <div>{n.name}</div>
    <Button on:click={() => addNetwork(n)}>Add network</Button>
   </div>
  {/each}
 </div>
</div>

{#if isModalEditNetworkOpen}
 <Modal title="Edit network" onClose={() => (isModalEditNetworkOpen = false)}>
  <ModalEditNetwork item={modalEditNetworkItem} onClose={() => (isModalEditNetworkOpen = false)} />
 </Modal>
{/if}
