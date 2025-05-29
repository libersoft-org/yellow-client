<script>
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import AccountStatusIcon from './AccountStatusIcon.svelte';
	import AccountTitle from './AccountTitle.svelte';
	import { debug } from '../../core.js';
	//import AccountStatus from './AccountStatus.svelte';
	export let a;
	export let clickSelectAccount;
</script>

<BaseButton data-testid={'account ' + $a.credentials?.address} onClick={() => clickSelectAccount($a.id)}>
	<div class="item">
		<div class="title"><AccountStatusIcon account={a} /><AccountTitle {a} /></div>
		<!-- <small><AccountStatus account={a} /></small> -->
		{#if $debug}
			<div style="font-size: 12px;">
				<ul>
					<li>id: {$a.id}</li>
					<li>enabled: {$a.enabled}</li>
					<li>error: {$a.error}</li>
					<li>status: {$a.status}</li>
					<li>session_status: {$a.session_status}</li>
					<li>sessionID: {$a.sessionID}</li>
					<li>bufferedAmount: {$a.bufferedAmount}b</li>
					<li>lastCommsTs: {Date($a.lastCommsTs)}</li>
					<li>available_modules: {JSON.stringify($a.available_modules)}</li>
					<li>wsGuid: {$a.wsGuid}</li>
				</ul>
			</div>
		{/if}
	</div>
</BaseButton>

<style>
	.item {
		display: flex;
		flex-direction: column;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		padding: 10px;
		color: #fff;
	}

	.item:hover {
		background-color: #222;
	}

	.item .title {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1 1 auto;
		overflow: hidden;
	}
</style>
