<script>
 import AccountStatusIcon from './account-status-icon.svelte';
 import AccountTitle from './account-title.svelte';
 import { debug } from '../core.js';
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
  display: flex;
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

 .item .title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  overflow: hidden;
 }
</style>

<div class="item" role="button" tabindex="0" on:click={() => clickSelectAccount($a.id)} on:keydown={event => keySelectAccount($a.id, event)}>
 <div class="title"><AccountStatusIcon {a} /><AccountTitle {a} /></div>
 {#if $debug}
  <small>
   <ul>
    <li>enabled: {$a.enabled}</li>
    <li>error: {$a.error}</li>
    <li>status: {$a.status}</li>
    <li>session_status: {$a.session_status}</li>
    <li>sessionID: {$a.sessionID}</li>
   </ul>
  </small>
 {/if}
</div>
