<script lang="ts">
	import { type INetwork, type IRPCServer, checkRPCServer, checkAllRPCServers, formatLatency, formatBlockNumber, formatBlockAge, getRPCServersFromNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	let { network }: { network: INetwork } = $props();
	let rpcServers = $state<IRPCServer[]>([]);
	let initialized = $state(false);

	$effect(() => {
		if (network?.rpcURLs) {
			if (!initialized || rpcServers.length === 0) {
				rpcServers = getRPCServersFromNetwork(network);
				initialized = true;
				checkAllRPCServers(rpcServers).catch(console.error);
			}
		} else {
			initialized = false;
			rpcServers = [];
		}
	});

	function handleRefreshServer(server: IRPCServer) {
		checkRPCServer(server).catch(console.error);
	}
</script>

<style>
	.rpc-servers {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="rpc-servers">
	<div class="bold">Network: {network.name}</div>
	{#if rpcServers.length === 0}
		<div class="bold">No RPC servers configured for this network</div>
	{:else}
		{#each rpcServers as server}
			<Table breakpoint="0">
				<Thead>
					<TheadTr>
						<Th expand>{server.url}</Th>
						<Th padding="0" align="right">
							{#if !server.checking}
								<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="20px" onClick={() => handleRefreshServer(server)} />
							{/if}
						</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					<TbodyTr>
						<Td bold>Status:</Td>
						<Td align="right" expand>
							{#if server.checking}
								<Spinner size="16px" colorVariable="--primary-foreground" />
							{:else}
								<Icon img={server.isAlive ? 'img/check.svg' : 'img/cross.svg'} alt={server.isAlive ? 'Online' : 'Offline'} colorVariable="--primary-foreground" size="16px" />
							{/if}
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Latency:</Td>
						<Td align="right" expand>
							{#if server.checking}
								<Spinner size="16px" colorVariable="--primary-foreground" />
							{:else}
								{formatLatency(server.latency)}
							{/if}
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Last block:</Td>
						<Td align="right" expand>
							{#if server.checking}
								<Spinner size="16px" colorVariable="--primary-foreground" />
							{:else}
								{formatBlockNumber(server.lastBlock)}
							{/if}
						</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Block age:</Td>
						<Td align="right" expand>
							{#if server.checking}
								<Spinner size="16px" colorVariable="--primary-foreground" />
							{:else}
								{formatBlockAge(server.blockAge)}
							{/if}
						</Td>
					</TbodyTr>
				</Tbody>
			</Table>
		{/each}
	{/if}
</div>
