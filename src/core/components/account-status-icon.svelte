<script>
 export let a;
</script>

<style>
 .status-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid #000;
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
 .status-connected {
  background-color: yellow;
 }
 .status-enabled {
  background-color: yellow;
 }
 .status-default {
  background-color: blue;
 }
 .status-disabled {
  background-color: gray;
 }
</style>

<span class="status-icon {$a.session_status === 'Logged in.' ? 'status-logged-in' : $a.status === 'Connecting...' ? 'status-connecting' : $a.status === 'Connected, logging in...' ? 'status-logging-in' : $a.status === 'Connected.' ? 'status-connected' : $a.status === 'Retrying...' ? 'status-retrying' : $a.status === 'Login failed.' ? 'status-login-failed' : $a.status === 'Disabled.' ? 'status-disabled' : $a.status === 'Enabled.' ? 'status-enabled' : 'status-default'}"></span>
