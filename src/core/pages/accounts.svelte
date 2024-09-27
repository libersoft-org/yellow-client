<script>
 import { accounts_config } from '../core.js';
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
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  height: calc(100% - 20px);
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

 .account table tbody tr td .action-items {
  display: flex;
 }

 .accounts .buttons {
  display: flex;
  gap: 10px;
 }
</style>

// TODO: copy table header style from admin<br />
// TODO: add border to buttons (the same as in admin)<br />
// TODO: fix table align (the same as in admin)<br />
// TODO: add back button (mobile size only) and add new button functionality<br />
// TODO: back button should be visible only on mobile platform<br />
// TODO: fix icon align-items

<div class="accounts">
 <div class="buttons">
  <div class="button">Back</div>
  <div class="button">Add new account</div>
 </div>
 <table>
  <thead>
   <th>Account</th>
   <th>Title</th>
   <th>Server</th>
   <th>Address</th>
   <th>Action</th>
  </thead>
  <tbody>
   {#each $accounts_config as a (a.id)}
    <tr>
     <td>{a.id}</td>
     <td>{a.title}</td>
     <td>{a.credentials.server}</td>
     <td>{a.credentials.address}</td>
     <td>{a.enabled ? 'Yes' : 'No'}</td>
     <td>
      <div class="action-items">
       <ActionButton img="img/edit.svg" title="Edit" on:click={() => clickEdit(a.id)} />
       <ActionButton img="img/del.svg" title="Delete" on:click={() => clickDel(a.id)} />
      </div>
     </td>
    </tr>
   {/each}
  </tbody>
 </table>
</div>
