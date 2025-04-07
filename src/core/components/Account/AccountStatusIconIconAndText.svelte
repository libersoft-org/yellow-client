<script>
 import { findAccount } from '../../core.js';
 import { get } from 'svelte/store';
 import AccountStatusIcon from './AccountStatusIcon.svelte';
 import AccountStatus from './AccountStatus.svelte';
 export let account;
</script>

<AccountStatusIcon {account} /><AccountStatus {account} />
