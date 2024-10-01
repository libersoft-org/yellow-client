<script>
 import Item from '../components/history-item.svelte';
 let transactions = [{
  transactionID: '0x123456789123456789123456789123456789123456789',
  blockID: '1234567890',
  from: '0x456456456456456456456',
  to: '0x789789789789789789789',
  amount: '123.12345678',
  symbol: 'DAI',
  timestamp: '2024-10-10 12:34:56'
 }, {
  transactionID: '0x123456789123456789123456789123456789123456789',
  blockID: '1234567890',
  from: '0x456456456456456456456',
  to: '0x789789789789789789789',
  amount: '123.12345678',
  symbol: 'DAI',
  timestamp: '2024-10-10 12:34:56'
 }, {
  transactionID: '0x123456789123456789123456789123456789123456789',
  blockID: '1234567890',
  from: '0x456456456456456456456',
  to: '0x789789789789789789789',
  amount: '123.12345678',
  symbol: 'DAI',
  timestamp: '2024-10-10 12:34:56'
 }];

 function selectTransaction(id) {
  // TODO
  console.log('SELECTED TRANSACTION:', id);
 }
</script>

<div class="items">
 {#each transactions as t, index}
  <Item
   className={index % 2 === 0 ? 'even' : 'odd'}
   transactionID={t.transactionID}
   blockID={t.blockID}
   from={t.from}
   to={t.to}
   amount={t.amount}
   symbol={t.symbol}
   timestamp={t.timestamp}
   on:click={() => selectTransaction(index)}
  />
 {/each}
</div>