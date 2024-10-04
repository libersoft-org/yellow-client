<script>

 import { selectAddress, addAddress, selectedWallet } from '../wallet.js';
 import Button from '../../../core/components/button.svelte';


 selectedWallet.subscribe(value => {
  console.log('sidebar SELECTED WALLET', value);
 });


</script>

{#if $selectedWallet}
 <Button text="Generate new address" on:click={addAddress} />
 <ul>
  {#each $selectedWallet?.addresses || [] as address (address.index)}
   <li>
    <div class="address-name">{address.name}</div>
    <div class="address-value">{address.address}</div>
    <Button text="Select" on:click={selectAddress} />
   </li>
  {/each}
 </ul>
{/if}


