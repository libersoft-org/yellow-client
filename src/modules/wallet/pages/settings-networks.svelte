<script>
 import { networks } from '../networks.js';
</script>

<style>
 .items {
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .items .item {
  display: flex;
  gap: 5px;
  padding: 5px;
 }

 .items .item.even {
  background-color: #ffa;
 }

 .items .item.odd {
  background-color: #ffd;
 }

 .items .item:hover {
  background-color: #fd1;
 }

 .items .item img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="networks">
 <div class="items">
  {#each $networks as n, index}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    {#if n.currency?.iconURL}
     <img src={n.currency.iconURL} alt="" />
    {/if}
    <div>{n.name}</div>
   </div>
  {/each}
 </div>
</div>
