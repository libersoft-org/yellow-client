<script>
 import { networks } from '../networks.js';
 import { selectedNetwork } from '../wallet.js';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let onClose;

 function selectNetwork(id) {
  console.log('SETTING NETWORK', id);
  selectedNetwork.set($networks.find(n => n.id === id));
  onClose();
 }
</script>

<style>

</style>

<List>
 {#each $networks as n, index (n.id)}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} item={n.name} on:click={() => selectNetwork(n.id)} />
 {/each}
</List>
