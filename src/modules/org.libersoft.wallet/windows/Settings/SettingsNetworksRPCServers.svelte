<script lang="ts">
	import { type INetwork } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface IRPCServer {
		url: string;
		latency: number | null;
		lastBlock: number | null;
		blockAge: number | null;
		isAlive: boolean;
		checking?: boolean;
	}
	let { network }: { network: INetwork } = $props();
	let rpcServers = $state<IRPCServer[]>([]);
	let initialized = $state(false);

	$effect(() => {
		if (network?.rpcURLs) {
			if (!initialized || rpcServers.length === 0) {
				rpcServers = network.rpcURLs.map(url => ({
					url,
					latency: null,
					lastBlock: null,
					blockAge: null,
					isAlive: false,
					checking: false,
				}));
				initialized = true;
				checkAllRPCServers();
			}
		} else {
			initialized = false;
			rpcServers = [];
		}
	});

	async function checkRPCServer(server: IRPCServer) {
		server.checking = true;
		const startTime = Date.now();
		try {
			const isWebSocket = server.url.startsWith('ws://') || server.url.startsWith('wss://');
			if (isWebSocket) await checkWebSocketRPCServer(server, startTime);
			else await checkHTTPRPCServer(server, startTime);
		} catch (error) {
			console.error('Error checking RPC server ' + server.url + ':', error);
			server.latency = null;
			server.lastBlock = null;
			server.blockAge = null;
			server.isAlive = false;
		} finally {
			server.checking = false;
		}
	}

	async function checkHTTPRPCServer(server: IRPCServer, startTime: number) {
		const blockNumberResponse = await fetch(server.url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_blockNumber',
				params: [],
				id: 1,
			}),
			signal: AbortSignal.timeout(10000),
		});

		if (!blockNumberResponse.ok) throw new Error('HTTP ' + blockNumberResponse.status + ': ' + blockNumberResponse.statusText);
		const blockNumberData = await blockNumberResponse.json();
		if (blockNumberData.error) throw new Error('RPC Error: ' + blockNumberData.error.message);
		const blockNumber = parseInt(blockNumberData.result, 16);
		let blockAge: number | null = null;

		try {
			const blockResponse = await fetch(server.url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					jsonrpc: '2.0',
					method: 'eth_getBlockByNumber',
					params: [blockNumberData.result, false],
					id: 2,
				}),
				signal: AbortSignal.timeout(5000),
			});
			if (blockResponse.ok) {
				const blockData = await blockResponse.json();
				if (!blockData.error && blockData.result && blockData.result.timestamp) {
					const blockTimestamp = parseInt(blockData.result.timestamp, 16);
					const currentTime = Math.floor(Date.now() / 1000);
					blockAge = currentTime - blockTimestamp;
				}
			}
		} catch (blockError) {
			console.warn('Could not get block details for ' + server.url + ':', blockError);
		}
		const endTime = Date.now();
		server.latency = endTime - startTime;
		server.lastBlock = blockNumber;
		server.blockAge = blockAge;
		server.isAlive = true;
	}

	async function checkWebSocketRPCServer(server: IRPCServer, startTime: number) {
		return new Promise<void>((resolve, reject) => {
			const ws = new WebSocket(server.url);
			let resolved = false;
			let blockNumber: number | null = null;
			let blockAge: number | null = null;
			let requestCount = 0;
			const cleanup = () => {
				if (ws.readyState === WebSocket.OPEN) ws.close();
			};
			const timeout = setTimeout(() => {
				if (!resolved) {
					resolved = true;
					cleanup();
					reject(new Error('WebSocket connection timeout'));
				}
			}, 10000);
			ws.onopen = () => {
				ws.send(
					JSON.stringify({
						jsonrpc: '2.0',
						method: 'eth_blockNumber',
						params: [],
						id: 1,
					})
				);
			};
			ws.onmessage = async event => {
				try {
					const data = JSON.parse(event.data);
					if (data.id === 1) {
						if (data.error) throw new Error('RPC Error: ' + data.error.message);
						blockNumber = parseInt(data.result, 16);
						ws.send(
							JSON.stringify({
								jsonrpc: '2.0',
								method: 'eth_getBlockByNumber',
								params: [data.result, false],
								id: 2,
							})
						);
					} else if (data.id === 2) {
						if (!data.error && data.result && data.result.timestamp) {
							const blockTimestamp = parseInt(data.result.timestamp, 16);
							const currentTime = Math.floor(Date.now() / 1000);
							blockAge = currentTime - blockTimestamp;
						}
						if (!resolved) {
							resolved = true;
							clearTimeout(timeout);
							const endTime = Date.now();
							server.latency = endTime - startTime;
							server.lastBlock = blockNumber;
							server.blockAge = blockAge;
							server.isAlive = true;
							cleanup();
							resolve();
						}
					}
				} catch (error) {
					if (!resolved) {
						resolved = true;
						clearTimeout(timeout);
						cleanup();
						reject(error);
					}
				}
			};

			ws.onerror = error => {
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					cleanup();
					reject(new Error('WebSocket error: ' + error));
				}
			};

			ws.onclose = event => {
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					if (event.code !== 1000) reject(new Error('WebSocket closed with code ' + event.code + ': ' + event.reason));
				}
			};
		});
	}

	async function checkAllRPCServers() {
		const promises = rpcServers.map(server => checkRPCServer(server));
		await Promise.all(promises);
	}

	function formatLatency(latency: number | null): string {
		if (latency === null) return 'N/A';
		return latency + 'ms';
	}

	function formatBlockNumber(blockNumber: number | null): string {
		if (blockNumber === null) return 'N/A';
		return blockNumber.toLocaleString();
	}

	function formatBlockAge(blockAge: number | null): string {
		if (blockAge === null) return 'N/A';
		if (blockAge < 60) return blockAge + 's ago';
		else if (blockAge < 3600) {
			const minutes = Math.floor(blockAge / 60);
			return minutes + 'm ago';
		} else if (blockAge < 86400) {
			const hours = Math.floor(blockAge / 3600);
			const minutes = Math.floor((blockAge % 3600) / 60);
			return hours + 'h ' + minutes + 'm ago';
		} else {
			const days = Math.floor(blockAge / 86400);
			const hours = Math.floor((blockAge % 86400) / 3600);
			return days + 'd ' + hours + 'h ago';
		}
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
								<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="20px" onClick={() => checkRPCServer(server)} />
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
