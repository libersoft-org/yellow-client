<script>
 import { selectedNetworkID, networks } from '../wallet.ts';
 import Input from '../../../core/components/input.svelte';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let close;
 let filter = '';

 function selectNetwork(id) {
  console.log('SETTING NETWORK', id);
  selectedNetworkID.set(id);
  close();
 }
</script>

<Input placeholder="Search" bind:value={filter} />
<List>
 {#each $networks as n, index}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} icon={n.currency.iconURL} item={n.name} onClick={() => selectNetwork(n.guid)} />
 {/each}
</List>
