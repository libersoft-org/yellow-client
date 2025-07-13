<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { networks, default_networks, type INetwork } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import DialogDeleteNetwork from '@/org.libersoft.wallet/dialogs/NetworksDel.svelte';
	let selectedItemID: string | null | undefined;
	let selectedItem: INetwork | null | undefined = $state();
	let elDialogDeleteNetwork: DialogDeleteNetwork | undefined;
	const setSettingsSection = getContext<Function>('setSettingsSection');

	async function clickAddEditNetwork(net: INetwork | null = null, edit: boolean = false) {
		if (net) {
			if (edit) await setSettingsSection('networks-edit-' + net.guid);
			else await setSettingsSection('networks-add', { network: net });
		} else await setSettingsSection('networks-add', { network: undefined });
	}

	function clickDeleteNetwork(net) {
		selectedItem = net;
		elDialogDeleteNetwork?.open();
	}

	function openTokens(net) {
		console.log('tokenList', net);
		selectedItemID = net.guid;
		setSettingsSection('networks-tokens-' + net.guid, { item: net.guid });
	}

	function doImport() {
		setSettingsSection('networks-import');
	}

	function doExport() {
		setSettingsSection('networks-export');
	}

	function openRPCServers(network: INetwork) {
		setSettingsSection('networks-rpc-' + network.guid);
	}
</script>

<style>
	.networks {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.network {
		display: flex;
		align-items: center;
		padding: 0 10px;
		gap: 10px;
		height: 50px;
	}
</style>

<div class="networks" data-testid="wallet-settings-networks">
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/network-add.svg" text="Add a network" onClick={() => clickAddEditNetwork()} data-testid="wallet-settings-networks-add-new-btn" />
		<Button img="img/import.svg" text="Import" onClick={() => doImport()} data-testid="wallet-settings-networks-import-btn" />
		<Button img="img/export.svg" text="Export" onClick={() => doExport()} data-testid="wallet-settings-networks-export-btn" />
	</ButtonBar>
	{#if $networks.length !== 0}
		<div class="bold">My networks:</div>
	{/if}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Network</Th>
				<Th align="center">Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $networks as n, index (n.guid)}
				<TbodyTr>
					<Td padding="0" expand data-testid="wallet-settings-network-name@{n.name}">
						<div class="network">
							{#if n.currency?.iconURL}
								<Icon img={n.currency.iconURL} alt={n.name} padding="0px" />
							{/if}
							<div class="name">{n.name}</div>
						</div>
					</Td>
					<Td>
						<TableActionItems align="center">
							<Icon img="modules/{module.identifier}/img/network.svg" colorVariable="--primary-foreground" alt="RPC servers" size="20px" padding="5px" onClick={() => openRPCServers(n)} />
							<Icon img="modules/{module.identifier}/img/token.svg" colorVariable="--primary-foreground" alt="Token list" size="20px" padding="5px" onClick={() => openTokens(n)} testId="wallet-settings-network-tokens@{n.name}" />
							<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit network" size="20px" padding="5px" onClick={() => clickAddEditNetwork(n, true)} testId="wallet-settings-network-edit@{n.name}" />
							<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete network" size="20px" padding="5px" onClick={() => clickDeleteNetwork(n)} testId="wallet-settings-network-del@{n.name}" />
						</TableActionItems>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
	<div class="bold">Default networks:</div>
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Network</Th>
				<Th align="center">Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $default_networks as n, index}
				<TbodyTr>
					<Td padding="0" data-testid="wallet-settings-default-network-name@{n.name}">
						<div class="network">
							{#if n.currency?.iconURL}
								<Icon img={n.currency.iconURL} alt={n.name} padding="0px" />
							{/if}
							<div class="name">{n.name}</div>
						</div>
					</Td>
					<Td>
						<TableActionItems align="center">
							<Icon img="img/add.svg" alt="Add to my networks" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickAddEditNetwork(n)} testId="wallet-settings-default-network-add@{n.name}" />
						</TableActionItems>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
</div>
<DialogDeleteNetwork item={selectedItem} bind:this={elDialogDeleteNetwork} />
