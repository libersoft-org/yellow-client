<script>
 import { createEventDispatcher } from 'svelte';
 export let icon;
 export let symbol;
 export let amount;
 export let className = '';
 const dispatch = createEventDispatcher();

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

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

 .item .icon img {
  width: 40px;
  height: 40px;
 }

 .item .symbol {
  flex-grow: 1;
  font-size: 20px;
  font-weight: bold;
 }

 .item .amount {
  text-align: right;
 }

 .item .amount .crypto {
  font-weight: bold;
  font-size: 18px;
 }

 .item .amount .fiat {
  font-size: 14px;
  color: #555;
 }
</style>

<div class="item {className}" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
 {#if icon}
  <div class="icon"><img src="{icon}" alt="{symbol}" /></div>
 {/if}
 <div class="symbol">{symbol}</div>
 <div class="amount">
  <div class="crypto">{amount.crypto} {symbol}</div>
  <div class="fiat">({amount.fiat} USD)</div>
 </div>
</div>