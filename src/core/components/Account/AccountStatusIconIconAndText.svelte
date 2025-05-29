<script>
	import AccountStatusIcon from './AccountStatusIcon.svelte';
	import AccountStatus from './AccountStatus.svelte';
	export let account;
</script>

<div>
	<AccountStatusIcon {account} />
	<AccountStatus {account} />
</div>

<style>
	div {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
	}
</style>
