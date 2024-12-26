<script>
 import Button from '../../../core/components/button.svelte';
 import Icon from '../../../core/components/icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from './token-list-add-edit.svelte';
 import ModalDel from './token-list-del.svelte';
 import { networks } from '../wallet.ts';
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
 }

 function editTokenModal(item) {
  console.log('EDIT TOKEN MODAL:', item);
  modalItem = item;
  showModalAddEdit = true;
 }

 function onEdit(token) {
  console.log('EDIT TOKEN:', token);
  net.tokens = net.tokens.map(t => (t.guid === token.guid ? token : t));
  networks.update(v => v);
 }

 function delTokenModal(item) {
  console.log('DELETE TOKEN MODAL:', item);
  modalItem = item;
  showModalDel = true;
 }

 function onDel(token) {
  console.log('DELETE TOKEN:', token);
  net.tokens = net.tokens.filter(t => t.guid !== token.guid);
  networks.update(v => v);
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
  <Button text="Add token" onClick={addTokenModal} />
 </div>

 <div class="label">Network name: {net?.name}</div>
 <div class="label">Tokens:</div>
 {#if net?.tokens}
  <table>
   <thead>
    <tr>
     <th>Name</th>
     <th>Icon</th>
     <th>Symbol</th>
     <th>Token address</th>
     <th>Action</th>
    </tr>
   </thead>
   <tbody>
    {#each net.tokens as t, i}
     <tr>
      <td>{t.name}</td>
      <td>{t.icon}</td>
      <td>{t.symbol}</td>
      <td>{t.contract_address}</td>
      <td>
       <div class="icons">
        <!-- () => (item_tokens = item_tokens.filter((v, j) => j !== i)) -->
        <Icon img="img/edit.svg" alt="Edit token" size="20" padding="5" onClick={() => editTokenModal(t)} />
        <Icon img="img/del.svg" alt="Delete token" size="20" padding="5" onClick={() => delTokenModal(t)} />
       </div>
      </td>
     </tr>
    {/each}
   </tbody>
  </table>
 {/if}
</div>
<Modal title={modalItem ? 'Edit token' : 'Add token'} body={ModalAddEdit} params={{ item: modalItem, onAdd, onEdit }} bind:show={showModalAddEdit} />
<Modal title={'Delete token'} body={ModalDel} params={{ item: modalItem, onDel: onDel }} bind:show={showModalDel} />
