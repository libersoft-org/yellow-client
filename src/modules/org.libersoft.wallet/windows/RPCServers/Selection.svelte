<script lang="ts">
	import { selectedNetwork, getRPCServersFromNetwork, checkAllRPCServers, checkRPCServer, formatLatency, formatBlockNumber, formatBlockAge, type IRPCServer, type INetwork } from 'libersoft-crypto/network';
	import { rpcURL, selectRPCURL } from 'libersoft-crypto/provider';
	import { onMount } from 'svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		close?: () => void;
		network?: INetwork;
	}
	let { close, network }: Props = $props();
	let rpcServers: IRPCServer[] = $state([]);
	let isChecking = $state(false);

	$effect(() => {
		if (network) rpcServers = getRPCServersFromNetwork(network);
		else if ($selectedNetwork) rpcServers = getRPCServersFromNetwork($selectedNetwork);
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

	function refreshServer(server: IRPCServer) {
		checkRPCServer(server).catch(console.error);
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

	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		justify-content: space-between;
		padding: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 10px;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
		cursor: pointer;
		transition: background-color 0.4s linear;
	}

	.item:hover,
	:global(.clickable:focus-visible) .item,
	:global(.clickable.focused) .item {
		background-color: var(--primary-soft-background);
	}

	.item.selected {
		background-color: var(--primary-background);
	}

	.item .info {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.item .info .url {
		font-weight: bold;
		word-break: break-all;
	}

	.item .info .stats {
		display: flex;
		gap: 20px;
		font-size: 14px;
	}

	.status {
		width: 10px;
		min-width: 10px;
		height: 10px;
		min-height: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 50%;
	}

	.item .status.alive {
		background-color: #080;
	}

	.item .status.dead {
		background-color: #800;
	}

	.item .status.checking {
		background-color: #f80;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>

{#snippet item(server: IRPCServer)}
	<div class="item" class:selected={server.url === $rpcURL}>
		<div class="info">
			<div class="url"><span>{server.url}</span></div>
			<div class="stats">
				<div>
					<span>Latency:</span>
					<span class="bold">{server.checking ? '?' : formatLatency(server.latency)}</span>
				</div>
				<div>
					<span>Block:</span>
					<span class="bold">{server.checking ? '?' : formatBlockNumber(server.lastBlock)}</span>
				</div>
				<div>
					<span>Age:</span>
					<span class="bold">{server.checking ? '?' : formatBlockAge(server.blockAge)}</span>
				</div>
			</div>
		</div>
		<div class="status" class:alive={server.isAlive} class:dead={!server.isAlive && !server.checking} class:checking={server.checking}></div>
	</div>
{/snippet}
{#if network}
	<div class="bold">Network: {network.name}</div>
{/if}
<ButtonBar>
	<Button img="img/reset.svg" text="Refresh all" onClick={checkServers} />
</ButtonBar>
{#if rpcServers.length === 0}
	<div>No RPC servers available for the selected network.</div>
{:else}
	<div class="servers">
		{#each rpcServers as server}
			<div class="row">
				{#if network}
					{@render item(server)}
				{:else}
					<Clickable onClick={() => selectServer(server.url)} expand>
						{@render item(server)}
					</Clickable>
				{/if}
				<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="16px" enabled={!server.checking} onClick={() => refreshServer(server)} />
			</div>
		{/each}
	</div>
{/if}
