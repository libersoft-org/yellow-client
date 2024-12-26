<script>
 import Item from '../components/balance-item.svelte';
 let tokens = [
  {
   icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
   symbol: 'DAI',
   amount: {
    crypto: 105,
    fiat: 104.98,
   },
  },
  {
   icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg',
   symbol: 'DOT',
   amount: {
    crypto: 13.58468432,
    fiat: 815.23,
   },
  },
 ];

 function selectToken(id) {
  console.log('SELECTED TOKEN:', id);
 }
</script>

<style>
 .items {
  border-radius: 10px;
  overflow: auto;
 }
</style>

<div class="items">
 {#each tokens as t, index}
  <Item className={index % 2 === 0 ? 'even' : 'odd'} icon={t.icon} symbol={t.symbol} amount={t.amount} onClick={() => selectToken(index)} />
 {/each}
</div>
