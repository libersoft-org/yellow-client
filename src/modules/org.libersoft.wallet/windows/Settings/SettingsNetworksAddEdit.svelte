<script lang="ts">
	import { getContext } from 'svelte';
	import { addNetwork, editNetwork, type INetwork, default_networks, loadDefaultNetworks, type IRPCServer, checkRPCServer, formatLatency, formatBlockNumber, formatBlockAge } from '@/org.libersoft.wallet/scripts/network.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	interface Props {
		network?: INetwork;
		edit?: boolean;
		close: () => void;
	}
	let { network, edit = false, close }: Props = $props();
	let itemName: string | undefined = $state();
	let itemCurrencySymbol: string | undefined = $state();
	let itemCurrencyIconURL: string | undefined = $state();
	let itemChainID: number | undefined = $state();
	let itemExplorerURL: string | undefined = $state();
	let itemRPCURLs: string[] | undefined = $state();
	let rpcServers: IRPCServer[] = $state([]);
	let error: string | null | undefined = $state();
	let elName: Input | undefined;
	let elCurrencySymbol: Input | undefined;
	let elChainID: Input | undefined;
	let elRPCURLs: (Input | undefined)[] = $state([]);
	const setSettingsSection = getContext<Function>('setSettingsSection');

	export function onOpen(): void {
		itemName = '';
		itemCurrencySymbol = '';
		itemCurrencyIconURL = '';
		itemChainID = undefined;
		itemExplorerURL = '';
		itemRPCURLs = [];
		if (network) {
			itemName = network.name;
			itemCurrencySymbol = network.currency?.symbol || '';
			itemCurrencyIconURL = network.currency?.iconURL || '';
			itemChainID = network.chainID;
			itemExplorerURL = network.explorerURL || '';
			itemRPCURLs = network.rpcURLs ? [...network.rpcURLs] : [];
		}
		error = null;
		updateRPCServers();
		elName?.focus();
	}

	function addEdit(): void {
		itemName = itemName?.trim();
		itemCurrencySymbol = itemCurrencySymbol?.trim();
		itemCurrencyIconURL = itemCurrencyIconURL?.trim();
		itemExplorerURL = itemExplorerURL?.trim();
		itemRPCURLs = itemRPCURLs?.map(url => url.trim());
		itemChainID = Number(itemChainID);
		const validationConfig = [{ field: itemName, element: elName, required: 'Network name is required' }, { field: itemCurrencySymbol, element: elCurrencySymbol, required: 'Currency symbol is required' }, { field: itemCurrencyIconURL }, { field: itemChainID, element: elChainID, validate: (v: number) => (v >= 0 && Number.isInteger(v) ? null : 'Chain ID must be a positive whole number') }, { field: itemExplorerURL }, { field: itemRPCURLs, isArray: true, arrayElements: elRPCURLs, required: 'RPC URL {index} is required' }];
		error = validateForm(validationConfig);
		if (error) return;
		const newItem: INetwork = {
			name: itemName || '',
			currency: {
				symbol: itemCurrencySymbol || '',
				iconURL: itemCurrencyIconURL,
			},
			chainID: itemChainID || 0,
			rpcURLs: itemRPCURLs || [],
			explorerURL: itemExplorerURL,
			tokens: network?.tokens || [],
		};
		if (edit && network?.guid) {
			newItem.guid = network.guid;
			editNetwork(newItem);
		} else addNetwork(newItem);
		setSettingsSection('networks');
	}

	async function loadRPCsFromDefaults(): Promise<void> {
		if (!itemChainID) {
			error = 'Please enter a Chain ID first';
			return;
		}
		try {
			let defaultNetworksData = $default_networks;
			if (defaultNetworksData.length === 0) defaultNetworksData = await loadDefaultNetworks();
			const defaultNetwork = defaultNetworksData.find(network => network.chainID === itemChainID);
			if (!defaultNetwork || !defaultNetwork.rpcURLs) {
				error = 'No default RPC URLs found for Chain ID: ' + itemChainID;
				return;
			}
			const currentRPCs = (itemRPCURLs || []).filter(url => url.trim() !== '');
			const newRPCs = defaultNetwork.rpcURLs.filter(url => !currentRPCs.includes(url));
			if (newRPCs.length === 0) {
				error = 'All default RPC URLs are already in the list';
				return;
			}
			itemRPCURLs = [...currentRPCs, ...newRPCs];
			error = null;
			elRPCURLs = new Array(itemRPCURLs.length).fill(undefined);
			updateRPCServers();
		} catch (err) {
			error = 'Failed to load default networks: ' + (err instanceof Error ? err.message : 'Unknown error');
		}
	}

	async function checkRPCServers(): Promise<void> {
		if (!itemRPCURLs) return;
		const promises = rpcServers.map(async server => await checkRPCServer(server));
		await Promise.all(promises);
	}

	function updateRPCServers(): void {
		if (!itemRPCURLs) {
			rpcServers = [];
			return;
		}
		const newRpcServers: IRPCServer[] = itemRPCURLs.map(url => {
			const trimmedUrl = url.trim();
			const existingServer = rpcServers.find(server => server.url === trimmedUrl);
			if (existingServer) return { ...existingServer, url: trimmedUrl };
			else {
				return {
					url: trimmedUrl,
					latency: null,
					lastBlock: null,
					blockAge: null,
					isAlive: false,
					checking: false,
				};
			}
		});
		rpcServers = newRpcServers;
	}
</script>

<style>
	.window-edit-network {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.row {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.rpc-item {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
		padding: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 10px;
		background-color: var(--primary-soft-background);
	}

	.bold {
		font-weight: bold;
	}

	.status {
		width: 10px;
		min-width: 10px;
		height: 10px;
		min-height: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 50%;
	}

	.status.alive {
		background-color: #080;
	}

	.status.dead {
		background-color: #800;
	}

	.status.checking {
		background-color: #f80;
	}
</style>

<div class="window-edit-network">
	<Form onSubmit={addEdit}>
		<Label text="Name">
			<Input bind:value={itemName} bind:this={elName} data-testid="wallet-settings-network-name-input" />
		</Label>
		<Label text="Currency symbol">
			<Input bind:value={itemCurrencySymbol} bind:this={elCurrencySymbol} data-testid="wallet-settings-network-currency-symbol-input" />
		</Label>
		<Label text="Icon URL">
			<Input bind:value={itemCurrencyIconURL} data-testid="wallet-settings-network-icon-url-input" />
		</Label>
		<Label text="Chain ID">
			<Input type="number" bind:value={itemChainID} bind:this={elChainID} data-testid="wallet-settings-network-chain-id-input" />
		</Label>
		<Label text="Explorer URL">
			<Input bind:value={itemExplorerURL} data-testid="wallet-settings-network-explorer-url-input" />
		</Label>
		<Label text="RPC URLs">
			<div class="items">
				<ButtonBar>
					<Button img="modules/{module.identifier}/img/network-add.svg" text="Load RPCs from defaults" onClick={loadRPCsFromDefaults} data-testid="wallet-settings-network-load-defaults-btn" />
					<Button img="img/reset.svg" text="Check RPC servers" onClick={checkRPCServers} data-testid="wallet-settings-network-check-rpc-servers-btn" />
				</ButtonBar>
				{#if itemRPCURLs}
					{#each itemRPCURLs as rpc_url, i}
						<div class="rpc-item">
							<div class="row">
								<Input bind:value={itemRPCURLs[i]} bind:this={elRPCURLs[i]} data-testid="wallet-settings-network-rpc-url-input-{i}" />
								{#if rpcServers[i]}
									<div class="status" class:alive={rpcServers[i].isAlive} class:dead={!rpcServers[i].isAlive && !rpcServers[i].checking} class:checking={rpcServers[i].checking}></div>
								{/if}
								<Icon
									img="img/reset.svg"
									alt="Check RPC server"
									padding="5px"
									enabled={!rpcServers[i]?.checking}
									onClick={() => {
										if (rpcServers[i] && !rpcServers[i].checking) {
											checkRPCServer(rpcServers[i]);
										}
									}}
								/>
								<Icon
									img="img/del.svg"
									alt="Remove RPC URL"
									padding="5px"
									onClick={() => {
										itemRPCURLs = itemRPCURLs?.filter((v, j) => j !== i);
										updateRPCServers();
									}}
									testId="wallet-settings-network-rpc-url-remove-{i}"
								/>
							</div>
							{#if rpcServers[i]}
								<div class="row">
									<div>
										<span>Latency:</span>
										<span class="bold">{rpcServers[i].checking ? '?' : formatLatency(rpcServers[i].latency)}</span>
									</div>
									<div>
										<span>Block:</span>
										<span class="bold">{rpcServers[i].checking ? '?' : formatBlockNumber(rpcServers[i].lastBlock)}</span>
									</div>
									<div>
										<span>Age:</span>
										<span class="bold">{rpcServers[i].checking ? '?' : formatBlockAge(rpcServers[i].blockAge)}</span>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</Label>
		<Button
			img="img/add.svg"
			text="Add RPC URL"
			onClick={() => {
				itemRPCURLs = [...(itemRPCURLs || []), ''];
				updateRPCServers();
			}}
			data-testid="wallet-settings-network-add-rpc-url-btn"
		/>
	</Form>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	<ButtonBar expand>
		{#if edit}
			<Button img="img/save.svg" text="Save" onClick={addEdit} data-testid="wallet-settings-network-save-btn" />
		{:else}
			<Button img="modules/{module.identifier}/img/network-add.svg" text="Add network" onClick={addEdit} data-testid="wallet-settings-network-add-btn" />
		{/if}
		<Button img="img/cancel.svg" text="Cancel" onClick={close} data-testid="wallet-settings-network-cancel-btn" />
	</ButtonBar>
</div>
