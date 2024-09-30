<script>
 export let wallets;
 export let selectedWalletID = 0;
</script>

<style>
 
</style>

<div class="items">
 {#each wallets as w (w.id)}
  <div class="item">{w.id} - {w.name}</div>
 {/each}
</div>
