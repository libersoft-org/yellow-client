<script lang="ts">
	import { selectedNetwork, rpcURL, selectRPCURL, getRPCServersFromNetwork, checkAllRPCServers, formatLatency, formatBlockNumber, formatBlockAge, type IRPCServer } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { onMount } from 'svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();
	let rpcServers: IRPCServer[] = $state([]);
	let isChecking = $state(false);

	$effect(() => {
		if ($selectedNetwork) rpcServers = getRPCServersFromNetwork($selectedNetwork);
	});

	async function checkServers() {
		if (rpcServers.length === 0) return;
		isChecking = true;
		await checkAllRPCServers(rpcServers);
		isChecking = false;
	}

	function selectServer(url: string) {
		selectRPCURL(url);
		close?.();
	}

	onMount(() => {
		if (rpcServers.length > 0) checkServers();
	});
</script>

<style>
	.servers {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.servers .item {
		display: flex;
		align-items: center;
		gap: 10px;
		justify-content: space-between;
		padding: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 10px;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
		cursor: pointer;
		transition: background-color 0.4s linear;
	}

	.servers .item:hover {
		background-color: var(--primary-soft-background);
	}

	.servers .item.selected {
		background-color: var(--primary-background);
	}

	.servers .item .info .url {
		font-weight: bold;
		word-break: break-all;
	}

	.servers .item .info .stats {
		display: flex;
		gap: 20px;
		font-size: 12px;
	}

	.status {
		width: 10px;
		min-width: 10px;
		height: 10px;
		min-height: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 50%;
	}

	.servers .item .status.alive {
		background-color: #080;
	}

	.servers .item .status.dead {
		background-color: #800;
	}

	.servers .item .status.checking {
		background-color: #f80;
	}
</style>

<ButtonBar>
	<Button img="img/reset.svg" text="Refresh all" onClick={checkServers} />
</ButtonBar>
{#if rpcServers.length === 0}
	<div>No RPC servers available for the selected network.</div>
{:else}
	<div class="servers">
		{#each rpcServers as server}
			<div class="item" class:selected={server.url === $rpcURL} on:click={() => selectServer(server.url)}>
				<div class="info">
					<div class="url">{server.url}</div>
					<div class="stats">
						<span>Latency: {server.checking ? '?' : formatLatency(server.latency)}</span>
						<span>Block: {server.checking ? '?' : formatBlockNumber(server.lastBlock)}</span>
						<span>Age: {server.checking ? '?' : formatBlockAge(server.blockAge)}</span>
					</div>
				</div>
				<div class="status" class:alive={server.isAlive} class:dead={!server.isAlive && !server.checking} class:checking={server.checking}></div>
			</div>
		{/each}
	</div>
{/if}
