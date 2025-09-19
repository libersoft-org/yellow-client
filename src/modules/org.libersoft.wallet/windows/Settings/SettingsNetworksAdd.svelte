<script lang="ts">
	import { getContext } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { default_networks, type INetwork, addSingleNetwork } from 'libersoft-crypto/network';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Dialog, { type IDialogData, type IDialogButton } from '@/core/components/Dialog/Dialog.svelte';
	let filter = $state('');
	let showMainnets = $state(true);
	let showTestnets = $state(false);
	let filteredDefaultNetworks = $derived(
		$default_networks.filter(network => {
			const matchesFilter = network.name.toLowerCase().includes(filter.toLowerCase());
			const matchesNetworkType = (showMainnets && !network.testnet) || (showTestnets && network.testnet);
			return matchesFilter && matchesNetworkType;
		})
	);
	let elFilter: Input | undefined = $state();
	let addNetworkDialog: Dialog | undefined = $state();
	let selectedNetwork: INetwork | null = $state(null);

	// Dialog data for adding network
	let addDialogData: IDialogData = $derived({
		title: 'Add Network',
		body: selectedNetwork ? `Add the network "${(selectedNetwork as INetwork).name}"?` : '',
		buttons: [
			{ text: 'Add', onClick: handleAddNetwork },
			{ text: 'Edit..', onClick: handleAddModifiedNetwork },
			{ text: 'Cancel', onClick: handleCancelAdd },
		],
	});
	const setSettingsSection = getContext<Function>('setSettingsSection');

	export function onOpen(): void {
		elFilter?.focus();
	}

	function openRPCServers(network: INetwork) {
		setSettingsSection('networks-rpc-' + network.guid);
	}

	async function clickAddNetwork(net: INetwork | null = null) {
		if (net) {
			selectedNetwork = net;
			addNetworkDialog?.open();
		} else {
			// Add custom network - go directly to settings
			await setSettingsSection('networks-add-sw', { network: undefined });
		}
	}

	function handleAddNetwork() {
		console.log('SettingsNetworksAdd: Adding network: ', selectedNetwork);
		if (selectedNetwork) {
			addSingleNetwork(selectedNetwork);
			addNetworkDialog?.close();
		}
		setSettingsSection('networks');
	}

	async function handleAddModifiedNetwork() {
		if (selectedNetwork) {
			addNetworkDialog?.close();
			await setSettingsSection('networks-add-sw', { network: selectedNetwork });
		}
	}

	function handleCancelAdd() {
		addNetworkDialog?.close();
		selectedNetwork = null;
	}
</script>

<style>
	.network {
		display: flex;
		align-items: center;
		padding: 0 10px;
		gap: 10px;
		height: 50px;
	}

	.network .name {
		min-width: 0; /* Allow text to shrink */
	}

	.network-icon {
		flex-shrink: 0; /* Prevent icon from shrinking */
	}
</style>

<ButtonBar>
	<Button img="modules/{module.identifier}/img/network-add.svg" text="Add a custom network" onClick={() => clickAddNetwork()} data-testid="wallet-settings-add-custom-network" />
	Add a custom network
</ButtonBar>
<div class="bold">Default networks:</div>
<Input placeholder="Filter default networks..." bind:value={filter} bind:this={elFilter} />
<Table>
	<Tbody>
		<TbodyTr>
			<Td bold>Show mainnets:</Td>
			<Td><Switch bind:checked={showMainnets} /></Td>
		</TbodyTr>
		<TbodyTr>
			<Td bold>Show testnets:</Td>
			<Td><Switch bind:checked={showTestnets} /></Td>
		</TbodyTr>
	</Tbody>
</Table>
<Table breakpoint="0">
	<Thead>
		<TheadTr>
			<Th>Network</Th>
			<Th align="center">Action</Th>
		</TheadTr>
	</Thead>
	<Tbody>
		{#each filteredDefaultNetworks as n, index}
			<TbodyTr>
				<Td class="ellipsis" padding="0" data-testid="wallet-settings-default-network-name@{n.name}">
					<span class="network">
						{#if n.currency?.iconURL}
							<span class="network-icon td__icon">
								<Icon img={n.currency.iconURL} alt={n.name} padding="0px" />
							</span>
						{/if}
						<span class="name td__text">{n.name}</span>
					</span>
				</Td>
				<Td>
					<TableActionItems align="center">
						<Icon img="modules/{module.identifier}/img/network.svg" colorVariable="--primary-foreground" alt="RPC servers" size="20px" padding="5px" onClick={() => openRPCServers(n)} />
						<Icon img="img/add.svg" alt="Add to my networks" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickAddNetwork(n)} testId="wallet-settings-default-network-add@{n.name}" />
					</TableActionItems>
				</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>

<Dialog data={addDialogData} bind:this={addNetworkDialog} />
