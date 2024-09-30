<script>
 import { wallets, selectedWallet } from '../wallet.js';
 import List from '../components/list.svelte';
 import ListItem from '../components/list-item.svelte';
 export let onSetWallet;
 export let onClose;
 
 function selectWallet(id) {
  console.log('SETTING WALLET', id);
  selectedWallet.set($wallets[id]);
  onSetWallet();
  onClose();
 }
</script>

<List>
 {#each $wallets as w, index}
  <ListItem className={index % 2 === 0 ? 'even' : 'odd'} item={w.name} on:click={() => selectWallet(index)} />
 {/each}
</List>
