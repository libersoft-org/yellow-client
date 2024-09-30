<script>
 import { wallets, selectedWallet } from '../wallet.js';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let onClose;

 function selectWallet(id) {
  console.log('SETTING WALLET', id);
  selectedWallet.set($wallets.find(w => w.id === id));
  onClose();
 }
</script>

<style>

</style>

<List>
 {#each $wallets as w, index (w.id)}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} item={w.name} on:click={() => selectWallet(w.id)} />
 {/each}
</List>
