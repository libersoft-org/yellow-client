<script>
 import { networks } from '../networks.js';
 import { selectedNetworkID } from '../wallet.js';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let onClose;

 function selectNetwork(id) {
  console.log('SETTING NETWORK', id);
  selectedNetworkID.set(id);
  onClose();
 }
</script>

<List>
 {#each $networks as n, index}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} item={n.name} on:click={() => selectNetwork(n.name)} />
 {/each}
</List>
