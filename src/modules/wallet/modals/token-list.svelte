<script>
 import Button from '../../../core/components/button.svelte';
 import Icon from '../components/table-icon.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from './token-list-add-edit.svelte';
 import ModalDel from './token-list-del.svelte';
 //import { networks } from '../wallet.ts';
 //import { onMount } from 'svelte';
 export let onClose;
 export let item = null;
 let isModalAddEditOpen = false;
 let isModalDelOpen = false;
 //let item_tokens = [];

 /*
 onMount(() => {
  if (item) {
   item_tokens = (item.tokens || []).map(v => v);
  }
 });

 function save() {
  item.tokens = item_tokens;
  networks.update(v => v);
  onClose();
 }
 */

 function addTokenModal() {
  console.log('ADD TOKEN MODAL');
  isModalAddEditOpen = true;
 }

 function delTokenModal(id) {
  console.log('DELETE TOKEN MODAL:', id);
  isModalDelOpen = true;
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
       <Icon icon="img/del.svg" title="Delete token" on:click={delTokenModal(i)} />
      </div>
     </td>
    </tr>
   {/each}
  </table>
 {/if}
</div>
{#if isModalAddEditOpen}
 <Modal title="Add token" onClose={() => (isModalAddEditOpen = false)}>
  <ModalAddEdit onClose={() => (isModalDelOpen = false)} />
 </Modal>
{/if}
{#if isModalDelOpen}
 <Modal title="Delete token" onClose={() => (isModalDelOpen = false)}>
  <ModalDel onClose={() => (isModalDelOpen = false)} />
 </Modal>
{/if}
