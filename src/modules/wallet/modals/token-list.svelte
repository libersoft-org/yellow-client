<script>
 import Button from '../../../core/components/button.svelte';
 import Icon from '../components/table-icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from './token-list-add-edit.svelte';
 import ModalDel from './token-list-del.svelte';
 import { networks } from '../wallet.ts';
 export let show;
 export let params;

 let net;
 $: update($networks, params);

 function update(nets, params) {
  console.log('NETS:', nets, 'PARAMS:', params);
  let res = nets.find(v => v.guid === params.item);
  console.log('RES:', res);
  net = res;
  console.log('NET:', net);
 }

 console.log('NET:', net);

 let showModalAddEdit = false;
 let showModalDel = false;

 let modalItem = null;

 function addTokenModal() {
  console.log('ADD TOKEN MODAL');
  modalItem = null;
  showModalAddEdit = true;
 }

 function onAdd(token) {
  console.log('ADD TOKEN:', token);
  console.log('ADD TOKEN:', net);
  net.tokens.push(token);
  networks.update(v => v);
  showModalAddEdit = false;
 }

 function editTokenModal(item) {
  console.log('EDIT TOKEN MODAL:', item);
  modalItem = item;
  showModalAddEdit = true;
 }

 function onEdit(token) {
  console.log('EDIT TOKEN:', token);
  net.tokens = item.tokens.map(t => (t.guid === token.guid ? token : t));
  networks.update(v => v);
  showModalAddEdit = false;
 }

 function delTokenModal(item) {
  console.log('DELETE TOKEN MODAL:', item);
  modalItem = item;
  showModalDel = true;
 }

 function onDel(token) {
  console.log('DELETE TOKEN:', token);
  //item.tokens = item.tokens.filter(t => t !== token);
  net.tokens = net.tokens.filter(t => t.guid !== token.guid);
  networks.update(v => v);
  showModalDel = false;
 }
</script>

<style>
 .token-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .buttons {
  display: flex;
  gap: 10px;
 }

 .icons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="token-list">
 <div class="buttons">
  <!-- () => (item_tokens = [...item_tokens, { name: '', icon: '', symbol: '', contract_address: '' }]) -->
  <Button text="Add token" on:click={addTokenModal} />
 </div>

 <div class="label">Network name: {net?.name}</div>
 <div class="label">Tokens:</div>
 {#if net?.tokens}
  <table>
   <tr>
    <th>Name</th>
    <th>Icon</th>
    <th>Symbol</th>
    <th>Token address</th>
    <th>Action</th>
   </tr>
   {#each net.tokens as t, i}
    <tr>
     <td>{t.name}</td>
     <td>{t.icon}</td>
     <td>{t.symbol}</td>
     <td>{t.contract_address}</td>
     <td>
      <div class="icons">
       <!-- () => (item_tokens = item_tokens.filter((v, j) => j !== i)) -->
       <Icon icon="img/edit.svg" title="Edit token" on:click={() => editTokenModal(t)} />
       <Icon icon="img/del.svg" title="Delete token" on:click={() => delTokenModal(t)} />
      </div>
     </td>
    </tr>
   {/each}
  </table>
 {/if}
</div>
<Modal title="Add/edit token" body={ModalAddEdit} params={{ item: modalItem, onAdd, onEdit }} show={showModalAddEdit} />
<Modal title="Delete token" body={ModalDel} params={{ item: modalItem, onDel: onDel }} show={showModalDel} />
