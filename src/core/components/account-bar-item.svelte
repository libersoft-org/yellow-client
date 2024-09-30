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
 .status-icon {
   width: 10px;
   height: 10px;
   border-radius: 50%;
   display: inline-block;
 }
 .status-logged-in {
   background-color: green;
 }
 .status-logging-in {
   background-color: yellow;
 }
 .status-login-failed {
   background-color: red;
 }
 .status-retrying {
   background-color: orange;
 }
 .status-connecting {
  background-color: yellow;
 }
 .status-enabled {
  background-color: yellow;
 }
 .status-default {
   background-color: blue;
 }

 .status-connected {
   background-color: green;
 }
 .status-disabled {
   background-color: gray;
 }
</style>

<div class="item" role="button" tabindex="0" on:click={() => clickSelectAccount($a.id)} on:keydown={(event) => keySelectAccount($a.id, event)}>{$a.settings?.title}

  <div class="status-icon {$a.status === 'Logged in.'    ? 'status-logged-in' :
                           $a.status === 'Connecting...'   ? 'status-connecting' :
                           $a.status === 'Connected, logging in...'   ? 'status-logging-in' :
                           $a.status === 'Connected.'   ? 'status-connected' :
                           $a.status === 'Retrying...'  ? 'status-retrying' :
                           $a.status === 'Login failed.' ? 'status-login-failed' :
                           $a.status === 'Disabled.'  ? 'status-disabled' :
                           $a.status === 'Enabled.'  ? 'status-enabled' :
                          'status-default'}"></div>

  <small>
   <ul>
     <li>enabled: {$a.enabled}</li>
     <li>status: {$a.status}</li>
     <li>error: {$a.error}</li>
     <li>sessionID: {$a.sessionID}</li>

   </ul>
 </small>
</div>
