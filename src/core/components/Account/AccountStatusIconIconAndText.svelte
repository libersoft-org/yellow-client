<script lang="ts">
	import AccountStatusIcon from '@/core/components/Account/AccountStatusIcon.svelte';
	import AccountStatus from '@/core/components/Account/AccountStatus.svelte';
	interface Props {
		account?: any;
	}
	let { account }: Props = $props();
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
