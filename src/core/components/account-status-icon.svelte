<script>
 export let a;
</script>

<style>
 .status-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
 }
 .status-logged-in {
  background-color: #080;
  border: 1px solid #040;
 }
 .status-logging-in {
  background-color: #fd3;
  border: 1px solid #b90;
 }
 .status-login-failed {
  background-color: #f00;
  border: 1px solid #800;
 }
 .status-retrying {
  background-color: #fa0;
  background-color: #b60;
 }
 .status-connecting {
  background-color: #fd3;
  border: 1px solid #b90;
 }
 .status-connected {
  background-color: #fd3;
  border: 1px solid #b90;
 }
 .status-enabled {
  background-color: #fd3;
  border: 1px solid #b90;
 }
 .status-default {
  background-color: #00f;
  border: 1px solid #008;
 }
 .status-disabled {
  background-color: #888;
  border: 1px solid #444;
 }
</style>

<span class="status-icon {$a.session_status === 'Logged in.' ? 'status-logged-in' : $a.status === 'Connecting...' ? 'status-connecting' : $a.status === 'Connected, logging in...' ? 'status-logging-in' : $a.status === 'Connected.' ? 'status-connected' : $a.status === 'Retrying...' ? 'status-retrying' : $a.status === 'Login failed.' ? 'status-login-failed' : $a.status === 'Disabled.' ? 'status-disabled' : $a.status === 'Enabled.' ? 'status-enabled' : 'status-default'}"></span>
