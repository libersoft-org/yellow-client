<script>
 import { wallets, walletAddresses, selectAddress } from '../wallet.ts';
 import Accordion from '../../../core/components/accordion.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 export let close;
 let activeIndex = null;
 let filter = '';

 function clickSelectAddress(wallet, address) {
  console.log('SETTING ADDRESS', wallet, address);
  selectAddress(wallet, address);
  close();
 }

 function keySelectAddress(wallet, address) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickSelectAddress(wallet, address);
  }
 }
</script>

<style>
 table {
  border-spacing: 0;
  overflow: hidden;
 }

 tr {
  cursor: pointer;
 }

 tr.even {
  background-color: #ffa;
 }

 tr.odd {
  background-color: #ffd;
 }

 tr:hover {
  background-color: #fd1;
 }

 td {
  padding: 5px;
 }
</style>

<InputText placeholder="Search" bind:value={filter} />
<Accordion items={$wallets} let:prop={wallet} bind:activeIndex>
 <table>
  <tbody>
   {#each walletAddresses(wallet) as address, index}
    <tr class={index % 2 === 0 ? 'even' : 'odd'} on:click={() => clickSelectAddress(wallet, address)} on:keydown={() => keySelectAddress(wallet, address)}>
     <td class="center">{address.index}</td>
     <td>{address.name}</td>
     <td>{address.address}</td>
    </tr>
   {/each}
  </tbody>
 </table>
</Accordion>
