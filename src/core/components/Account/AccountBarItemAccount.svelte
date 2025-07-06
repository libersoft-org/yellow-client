<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import AccountBarButton from '@/core/components/Account/AccountBarButton.svelte';
	import AccountStatusIcon from '@/core/components/Account/AccountStatusIcon.svelte';
	import AccountTitle from '@/core/components/Account/AccountTitle.svelte';
	interface Props {
		account?: any;
		clickSelectAccount: (id: any) => void;
	}
	let { account, clickSelectAccount }: Props = $props();
</script>

<style>
	.item {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.item .title {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>

<AccountBarButton data-testid={'account ' + $account.credentials?.address} onClick={() => clickSelectAccount($account.id)}>
	<div class="item">
		<div class="title"><AccountStatusIcon {account} /><AccountTitle {account} /></div>
		{#if $debug}
			<div style="font-size: 12px;">
				<ul>
					<li>id: {$account.id}</li>
					<li>enabled: {$account.enabled}</li>
					<li>error: {$account.error}</li>
					<li>status: {$account.status}</li>
					<li>session_status: {$account.session_status}</li>
					<li>sessionID: {$account.sessionID}</li>
					<li>bufferedAmount: {$account.bufferedAmount}b</li>
					<li>lastCommsTs: {new Date($account.lastCommsTs).toString()}</li>
					<li>available_modules: {JSON.stringify($account.available_modules)}</li>
					<li>wsGuid: {$account.wsGuid}</li>
				</ul>
			</div>
		{/if}
	</div>
</AccountBarButton>
