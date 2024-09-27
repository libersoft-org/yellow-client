<script>
 import { accounts } from '../core.js';
 import ActionButton from '../components/accounts-action-button.svelte';

 function clickEdit(id) {
  console.log('EDIT', id);
 }

 function clickDel(id) {
  console.log('DEL', id);
 }
</script>

<style>
 .accounts {
  display: flex;
  padding: 10px;
  height: calc(100vh - 20px);
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .accounts table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .accounts table thead tr {
  background-color: #222;
  color: #fff;
  text-align: left;
 }

 .accounts table tbody tr:nth-child(even) {
  background-color: #ffdd1130;
 }

 .accounts table tbody tr:nth-child(odd) {
  background-color: #ffdd1150;
 }

 .accounts table tbody tr:hover {
  background-color: #fd1;
 }
</style>

<div class="accounts">
 <div class="button">Add new account</div>
 <table>
  <thead>
   <th>Account</th>
   <th>Action</th>
  </thead>
  <tbody>
   <tr>
    {#each $accounts as a (a.id)}
     <td>{a.id}</td>
     <td>
      <ActionButton img="img/edit.svg" title="Edit" on:click={() => clickEdit(a.id)} />
      <ActionButton img="img/del.svg" title="Delete" on:click={() => clickDel(a.id)} />
     </td>
    {/each}
   </tr>
  </tbody>
 </table>
</div>
