<script>
 import { addNetwork, removeNetwork, networks, default_networks } from '../wallet.ts';
 import Icon from '../../../core/components/icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import Button from '../../../core/components/button.svelte';
 import ModalEditNetwork from '../modals/edit-network.svelte';
 import ModalTokenList from '../modals/token-list.svelte';
 import { get } from 'svelte/store';

 let showModalEditNetwork = false;
 let showModalTokenList = false;
 let modalItemID = null;
 let modalItem = null;

 function editNetwork(net) {
  console.log('editNetwork', net);
  modalItem = net;
  showModalEditNetwork = true;
 }

 function tokenList(net) {
  console.log('tokenList', net);
  modalItemID = net.guid;
  showModalTokenList = true;
 }

 function doExport() {
  console.log('EXPORT NETWORKS');
  let data = get(networks);
  let json = JSON.stringify(data, null, 2);
  console.log('EXPORTED NETWORKS:', json);
  window.prompt('Copy the exported networks:', json);
 }

 function doImport() {
  console.log('IMPORT NETWORKS');
  let json = window.prompt('Paste the exported networks here:');
  if (json) {
   try {
    let data = JSON.parse(json);
    console.log('IMPORTED NETWORKS:', data);
    networks.set(data);
   } catch (e) {
    console.error('IMPORT NETWORKS ERROR:', e);
   }
  }
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
 }
</style>

<div class="networks">
 <div class="bold">My networks:</div>
 <div class="buttons">
  <Button text="Export" onClick={() => doExport()} />
  <Button text="Import" onClick={() => doImport()} />
 </div>
 <div class="items">
  {#each $networks as n, index (n.guid)}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    {#if n.currency?.iconURL}
     <img src={n.currency.iconURL} alt="" />
    {/if}
    <div class="name">{n.name}</div>
    <div class="buttons">
     <Icon img="modules/org.libersoft.wallet/img/coin.svg" alt="Token list" size="20" padding="5" onClick={() => tokenList(n)} />
     <Icon img="img/edit.svg" alt="Edit network" size="20" padding="5" onClick={() => editNetwork(n)} />
     <Icon img="img/del.svg" alt="Delete network" size="20" padding="5" onClick={() => removeNetwork(n)} />
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
    <Icon img="img/add-black.svg" alt="Add to my networks" size="20" padding="5" onClick={() => addNetwork(n)} />
   </div>
  {/each}
 </div>
</div>
<Modal title="Edit network" body={ModalEditNetwork} params={{ item: modalItem }} bind:show={showModalEditNetwork} />
<Modal title="Token list" body={ModalTokenList} params={{ item: modalItemID }} bind:show={showModalTokenList} />
