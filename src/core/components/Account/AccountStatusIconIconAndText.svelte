<script>
 import { findAccount } from '../../core.js';
 import { get } from 'svelte/store';
 import AccountStatusIcon from './AccountStatusIcon.svelte';
 import AccountStatus from './AccountStatus.svelte';
 export let account;
</script>

<style>
 div {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
 }
</style>

<div>
 <AccountStatusIcon {account} />
 <AccountStatus {account} />
</div>
