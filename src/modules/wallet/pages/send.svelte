<script>
 let address;
 let amount;
 let currency;
 import Button from '../../../core/components/button.svelte';

 function send() {
  // TODO
  console.log('SEND:', address, amount, currency);
 }
</script>

<style>
 input, select {
  padding: 5px;
  border-radius: 10px;
  border: 1px solid #888;
  font: inherit;
  background-color: #fff;
 }

 .send {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }
</style>

<div class="send">
 <div class="group">
  <div class="label">Address to:</div>
  <div class="input"><input type="text" bind:value={address} /></div>
 </div>
 <div class="group">
  <div class="label">Amount:</div>
  <div class="input"><input type="text" bind:value={amount} /></div>
  <div class="input">
   <select bind:value={currency}>
    <option value="0">--- Currency ---</option>
   </select>
  </div>
 </div>
 <Button text="Send" on:click={send} />
</div>
