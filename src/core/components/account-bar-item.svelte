<script>
 import AccountStatusIcon from './account-status-icon.svelte';
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

 .item .title {
  display: flex;
  align-items: center;
  gap: 10px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click={() => clickSelectAccount($a.id)} on:keydown={event => keySelectAccount($a.id, event)}>
 <div class="title"><AccountStatusIcon {a} />{$a.settings?.title} - {$a.credentials?.address}</div>
 <small>
  <ul>
   <li>enabled: {$a.enabled}</li>
   <li>status: {$a.status}</li>
   <li>error: {$a.error}</li>
   <li>sessionID: {$a.sessionID}</li>
  </ul>
 </small>
</div>
