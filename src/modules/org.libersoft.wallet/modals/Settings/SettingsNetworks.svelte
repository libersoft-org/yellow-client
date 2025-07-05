<script lang="ts">
	import { module } from '../../scripts/module.ts';
	import { networks, default_networks, type INetwork } from '../../scripts/wallet.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import ModalTokenList from '../Networks/NetworksTokens.svelte';
	import DialogDeleteNetwork from '../../dialogs/NetworksDel.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import SettingsNetworksExport from './SettingsNetworksExport.svelte';
	import SettingsNetworksImport from './SettingsNetworksImport.svelte';
	import { getContext, tick } from 'svelte';
	type ModalInstance = {
		isOpen(): boolean;
		open(): void;
		close(): void;
		maximize(): void;
		restore(): void;
	};
	let modalItemID: string | null | undefined;
	let modalItem: INetwork | null | undefined;
	let elModalTokenList: ModalInstance | undefined;
	let elModalSettingsNetworksImport: ModalInstance | undefined;
	let elModalSettingsNetworksExport: ModalInstance | undefined;
	let elDialogDeleteNetwork: DialogDeleteNetwork | undefined;
	const setSettingsSection = getContext<Function>('setSettingsSection');

	async function clickAddEditNetwork(net: INetwork | null = null, edit: boolean = false) {
		if (net) await setSettingsSection('networks-edit-' + net.guid);
		else await setSettingsSection('networks-add');
	}

	async function clickDeleteNetwork(net) {
		modalItem = net;
		await tick();
		elDialogDeleteNetwork?.open();
	}

	function tokenList(net) {
		console.log('tokenList', net);
		modalItemID = net.guid;
		elModalTokenList?.open();
	}

	function doImport() {
		elModalSettingsNetworksImport?.open();
	}

	function doExport() {
		elModalSettingsNetworksExport?.open();
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

<div class="networks">
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/network-add.svg" text="Add a network" onClick={() => clickAddEditNetwork()} data-testid="networks-add-new-btn" />
		<Button img="img/import.svg" text="Import" onClick={() => doImport()} data-testid="networks-import-btn" />
		<Button img="img/export.svg" text="Export" onClick={() => doExport()} data-testid="networks-export-btn" />
	</ButtonBar>
	{#if $networks.length !== 0}
		<div class="bold">My networks:</div>
	{/if}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Network</Th>
				<Th>Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $networks as n, index (n.guid)}
				<TbodyTr>
					<Td padding="0" data-testid="network-name@{n.name}">
						<div class="network">
							{#if n.currency?.iconURL}
								<Icon img={n.currency.iconURL} alt={n.name} padding="0px" />
							{/if}
							<div class="name">{n.name}</div>
						</div>
					</Td>
					<Td>
						<TableActionItems>
							<Icon img="modules/{module.identifier}/img/token.svg" colorVariable="--primary-foreground" alt="Token list" size="20px" padding="5px" onClick={() => tokenList(n)} />
							<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit network" size="20px" padding="5px" onClick={() => clickAddEditNetwork(n, true)} />
							<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete network" size="20px" padding="5px" onClick={() => clickDeleteNetwork(n)} />
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
				<Th>Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $default_networks as n, index}
				<TbodyTr>
					<Td padding="0" data-testid="default-network-name@{n.name}">
						<div class="network">
							{#if n.currency?.iconURL}
								<Icon img={n.currency.iconURL} alt={n.name} padding="0px" />
							{/if}
							<div class="name">{n.name}</div>
						</div>
					</Td>
					<Td>
						<TableActionItems>
							<Icon img="img/add.svg" alt="Add to my networks" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickAddEditNetwork(n)} />
						</TableActionItems>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
</div>
<Modal title="Token list" body={ModalTokenList} params={{ item: modalItemID }} bind:this={elModalTokenList} testId="wallet-settings-networks-token-list" />
<Modal title="Import networks" body={SettingsNetworksImport} bind:this={elModalSettingsNetworksImport} testId="wallet-settings-networks-import" />
<Modal title="Export networks" body={SettingsNetworksExport} bind:this={elModalSettingsNetworksExport} testId="wallet-settings-networks-export" />
{#if modalItem}
	<DialogDeleteNetwork item={modalItem} bind:this={elDialogDeleteNetwork} />
{/if}
