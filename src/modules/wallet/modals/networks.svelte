<script>
 import { selectedNetworkID, networks } from '../wallet.ts';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let show;
 export let params;
 let filter = '';

 function selectNetwork(id) {
  console.log('SETTING NETWORK', id);
  selectedNetworkID.set(id);
  show = false;
 }
</script>

<input type="text" placeholder="Search" bind:value={filter} />
<List>
 {#each $networks as n, index}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} icon={n.currency.iconURL} item={n.name} on:click={() => selectNetwork(n.name)} />
 {/each}
</List>
