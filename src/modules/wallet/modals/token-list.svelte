<script>
 import Button from '../../../core/components/button.svelte';
 import Icon from '../components/table-icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from './token-list-add-edit.svelte';
 import ModalDel from './token-list-del.svelte';
 import { networks } from '../wallet.ts';

 export let onClose;
 export let item = null;
 let modalItem = null;

 let isModalAddEditOpen = false;
 let isModalDelOpen = false;

 function addTokenModal() {
  console.log('ADD TOKEN MODAL');
  modalItem = null;
  isModalAddEditOpen = true;
 }

 function onAdd(token) {
  console.log('ADD TOKEN:', token);
  if (!item.tokens) item.tokens = [];
  item.tokens.push(token);
  networks.update(v => v);
  isModalAddEditOpen = false;
 }

 function delTokenModal(item) {
  console.log('DELETE TOKEN MODAL:', item);
  modalItem = item;
  isModalDelOpen = true;
 }

 function onDel(token) {
  console.log('DELETE TOKEN:', token);
  item.tokens = item.tokens.filter(t => t !== token);
  networks.update(v => v);
  isModalDelOpen = false;
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
 <div class="label">Network name: {item.name}</div>
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
{#if isModalAddEditOpen}
 <Modal title="Add token" onClose={() => (isModalAddEditOpen = false)}>
  <ModalAddEdit item={modalItem} {onAdd} onClose={() => (isModalAddEditOpen = false)} />
 </Modal>
{/if}
{#if isModalDelOpen}
 <Modal title="Delete token" onClose={() => (isModalDelOpen = false)}>
  <ModalDel item={modalItem} {onDel} onClose={() => (isModalDelOpen = false)} />
 </Modal>
{/if}
