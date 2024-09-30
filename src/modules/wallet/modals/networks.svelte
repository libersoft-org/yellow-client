<script>
 import { networks } from '../networks.js';
 import { selectedNetwork } from '../wallet.js';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let onSetNetwork;
 export let onClose;

 function selectNetwork(id) {
  console.log('SETTING NETWORK', id);
  selectedNetwork.set($networks[id]);
  onSetNetwork();
  onClose();
 }
</script>

<List>
 {#each $networks as n, index}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} item={n.name} on:click={() => selectNetwork(index)} />
 {/each}
</List>
