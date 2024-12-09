<script>
 import { findAccount } from '../core.js';
 import { get } from 'svelte/store';
 import AccountStatusIcon from '../components/account-status-icon.svelte';
 import AccountStatus from '../components/account-status.svelte';

 export let account;
</script>

<AccountStatusIcon {account} /><AccountStatus {account} />
