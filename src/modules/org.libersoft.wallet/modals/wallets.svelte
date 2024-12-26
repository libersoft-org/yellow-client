<script>
 import { wallets, walletAddresses, selectAddress } from '../wallet.ts';
 import BaseButton from '../../../core/components/base-button.svelte';
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
</script>

<style>
 table {
  border-spacing: 0;
  overflow: hidden;
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
    <BaseButton onClick={() => clickSelectAddress(wallet, address)}>
     <tr class={index % 2 === 0 ? 'even' : 'odd'}>
      <td class="center">{address.index}</td>
      <td>{address.name}</td>
      <td>{address.address}</td>
     </tr>
    </BaseButton>
   {/each}
  </tbody>
 </table>
</Accordion>
