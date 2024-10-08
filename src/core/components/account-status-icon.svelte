<script>
 export let a;
</script>

<div class="status-icon {$a.status === 'Logged in.' ? 'status-logged-in' : $a.status === 'Connecting...' ? 'status-connecting' : $a.status === 'Connected, logging in...' ? 'status-logging-in' : $a.status === 'Connected.' ? 'status-connected' : $a.status === 'Retrying...' ? 'status-retrying' : $a.status === 'Login failed.' ? 'status-login-failed' : $a.status === 'Disabled.' ? 'status-disabled' : $a.status === 'Enabled.' ? 'status-enabled' : 'status-default'}"></div>

<style>
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
