<script>
 import Button from '../../../core/components/button.svelte';
 import Icon from '../components/table-icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from './token-list-add-edit.svelte';
 import ModalDel from './token-list-del.svelte';
 import { networks } from '../wallet.ts';
 import { onMount } from "svelte";
 export let show;
 export let params;
 export let item = null;
 let modalItem = null;
 let showModalAddEdit = false;
 let showModalDel = false;

 onMount(() => {
  item = params.item;
 });

 function addTokenModal() {
  console.log('ADD TOKEN MODAL');
  modalItem = null;
  showModalAddEdit = true;
 }

 function onAdd(token) {
  console.log('ADD TOKEN:', token);
  if (!item.tokens) item.tokens = [];
  item.tokens.push(token);
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
  item.tokens = item.tokens.filter(t => t !== token);
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
 <div class="label">Network name: {item?.name}</div>
 <div class="label">Tokens:</div>
 {#if item?.tokens}
  <table>
   <tr>
    <th>Name</th>
    <th>Icon</th>
    <th>Symbol</th>
    <th>Token address</th>
    <th>Action</th>
   </tr>
   {#each item.tokens as t, i}
    <tr>
     <td>{t.name}</td>
     <td>{t.icon}</td>
     <td>{t.symbol}</td>
     <td>{t.address}</td>
     <td>
      <div class="icons">
       <!-- () => (item_tokens = item_tokens.filter((v, j) => j !== i)) -->
       <Icon icon="img/del.svg" title="Delete token" on:click={() => delTokenModal(t)} />
      </div>
     </td>
    </tr>
   {/each}
  </table>
 {/if}
</div>
<Modal title="Add token" body={ModalAddEdit} params={{ item: modalItem, onAdd: onAdd }} show={showModalAddEdit} />
<Modal title="Delete token" body={ModalDel} params={{ item: modalItem, onDel: onDel }} show={showModalDel} />
