<script>
 import { createEventDispatcher } from 'svelte';
 export let transactionID;
 export let blockID;
 export let timestamp;
 export let from;
 export let to;
 export let amount;
 export let symbol;
 export let className = '';
 const dispatch = createEventDispatcher();

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

<div class="item {className}" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 <div class="transaction-id">{transactionID}</div>
 <div class="block-id">{blockID}</div>
 <div class="from">{from}</div>
 <div class="to">{to}</div>
 <div class="amount">{amount}</div>
 <div class="symbol">{symbol}</div>
 <div class="timestamp">{timestamp}</div>
</div>

<style>
 .item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
 }

 .item.even {
  background-color: #ffa;
 }

 .item.odd {
  background-color: #ffd;
 }

 .item:hover {
  background-color: #fd1;
 }
</style>
