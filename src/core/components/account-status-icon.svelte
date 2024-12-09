<script>
 export let account;

 $: status_class = !account ? 'status-default' : $account.session_status === 'Logged in.' ? 'status-logged-in' : $account.status === 'Connecting...' ? 'status-connecting' : $account.status === 'Connected, logging in...' ? 'status-logging-in' : $account.status === 'Connected.' ? 'status-connected' : $account.status === 'Retrying...' ? 'status-retrying' : $account.status === 'Login failed.' ? 'status-login-failed' : $account.status === 'Disabled.' ? 'status-disabled' : $account.status === 'Enabled.' ? 'status-enabled' : 'status-default';
</script>

<style>
 .status-icon {
  width: 10px;
  min-width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
 }

 .status-logged-in {
  background-color: #080;
  border: 1px solid #040;
 }

 .status-login-failed {
  background-color: #f00;
  border: 1px solid #800;
 }

 .status-retrying {
  background-color: #b60;
  border: 1px solid #820;
 }

 .status-connecting {
  background-color: #fd3;
  border: 1px solid #600;
 }

 .status-connected {
  background-color: #fd3;
  border: 1px solid #b90;
 }

 .status-logging-in {
  background-color: #dfd;
  border: 1px solid #290;
 }

 .status-enabled {
  background-color: #55f;
  border: 1px solid #00f;
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

<span class="status-icon {status_class}"></span>
