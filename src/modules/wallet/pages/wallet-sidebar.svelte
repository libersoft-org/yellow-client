<script>

 import { addresses, newAddress, selectAddress } from '../wallet.js';
 import Button from '../../../core/components/button.svelte';

 </script>

<ul>
{#each $addresses as address (address.index)}

   <li>
   <div class="address-name">{address.index}</div> -
    <div class="address-value">{address.address}</div>
    (<div class="address-name">{address.name}</div>)
    <Button text="Select" onClick={() => selectAddress(address)} />
  </li>
{/each}
</ul>

<Button text="Add new address" onClick={newAddress} />
