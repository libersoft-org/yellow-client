<script>
 import BaseButton from './base-button.svelte';
 import AccountStatusIcon from './account-status-icon.svelte';
 import AccountTitle from './account-title.svelte';
 import { debug, findAccount } from '../core.js';
 import { get } from 'svelte/store';
 import AccountStatus from './account-status.svelte';
 export let a;
 export let clickSelectAccount;
</script>

<style>
 .item {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 10px;
  color: #fff;
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

<BaseButton onClick={() => clickSelectAccount($a.id)}>
 <div class="item">
  <div class="title"><AccountStatusIcon account={a} /><AccountTitle {a} /></div>
  <small><AccountStatus account={a} /></small>
  {#if $debug}
   <small>
    <ul>
     <li>enabled: {$a.enabled}</li>
     <li>error: {$a.error}</li>
     <li>status: {$a.status}</li>
     <li>session_status: {$a.session_status}</li>
     <li>sessionID: {$a.sessionID}</li>
     <li>bufferedAmount: {$a.bufferedAmount}b</li>
     <li>lastCommsTs: {Date($a.lastCommsTs)}</li>
    </ul>
   </small>
  {/if}
 </div>
</BaseButton>
