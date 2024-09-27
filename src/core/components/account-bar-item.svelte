<script>
 import { toggleAccountEnabled } from '../../core/core.js';
 export let a;
 export let clickSelectAccount;

 function keySelectAccount(id, event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   event.stopPropagation();
   clickSelectAccount(id);
  }
 }

 </script>

<style>
 .item {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 10px;
  color: #fff;
  cursor: pointer;
 }

 .item:hover {
  background-color: #222;
 }
</style>

<div class="item" role="button" tabindex="0" on:click={() => clickSelectAccount($a.id)} on:keydown={(event) => keySelectAccount($a.id, event)}>{$a.title}
  <small>
   <ul>
    {#each Object.entries($a) as [key, value]}
     <li>{key}: {value}</li>
    {/each}
    {#each Object.entries($a.credentials) as [key, value]}
     <li>{key}: {value}</li>
    {/each}
   </ul>
 </small>
</div>
