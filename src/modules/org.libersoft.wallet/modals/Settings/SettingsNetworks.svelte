<script lang="ts">
	import { module } from '../../module.ts';
	import { networks, default_networks, type INetwork } from '../../wallet.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import ModalEditNetwork from '../Networks/NetworksAddEdit.svelte';
	import ModalTokenList from '../Networks/NetworksTokens.svelte';
	import DialogDeleteNetwork from '../../dialogs/NetworksDel.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import SettingsNetworksExport from './SettingsNetworksExport.svelte';
	import SettingsNetworksImport from './SettingsNetworksImport.svelte';

	type ModalInstance = {
		isOpen(): boolean;
		open(): void;
		close(): void;
		maximize(): void;
		restore(): void;
	};
	let modalItemID: string | null | undefined;
	let modalEdit: boolean = false;
	let modalItem: INetwork | null | undefined;
	let elModalAddEditNetwork: ModalEditNetwork | undefined;
	let elModalTokenList: ModalTokenList | undefined;
	let elModalSettingsNetworksImport: ModalInstance | undefined;
	let elModalSettingsNetworksExport: ModalInstance | undefined;
	let elDialogDeleteNetwork: DialogDeleteNetwork | undefined;

	function clickAddEditNetwork(net: INetwork | null = null, edit: boolean = false) {
		console.log('clickAddNetwork', net);
		modalEdit = edit;
		modalItem = net;
		elModalAddEditNetwork?.open();
	}

	function clickDeleteNetwork(net) {
		console.log('clickDeleteNetwork', net);
		modalItem = net;
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
</style>

<div class="networks">
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/network-add.svg" text="Add a network" onClick={clickAddEditNetwork} data-testid="networks-add-new-btn" />
		<Button img="img/import.svg" text="Import" onClick={() => doImport()} data-testid="networks-import-btn" />
		<Button img="img/export.svg" text="Export" onClick={() => doExport()} data-testid="networks-export-btn" />
	</ButtonBar>
	{#if $networks.length !== 0}
		<div class="bold">My networks:</div>
	{/if}
	<Table breakpoint="500px">
		<Tbody>
			{#each $networks as n, index (n.guid)}
				<TbodyTr>
					<Td data-testid="network-name@{n.name}">
						<div>
							{#if n.currency?.iconURL}
								<Icon img={n.currency.iconURL} alt="" />
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
	<Table breakpoint="500px">
		<Tbody>
			{#each $default_networks as n, index}
				<TbodyTr>
					<Td data-testid="default-network-name@{n.name}">
						<div>
							{#if n.currency?.iconURL}
								<Icon img={n.currency.iconURL} />
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
<Modal title={modalEdit ? 'Edit network' : 'Add a new network'} body={ModalEditNetwork} params={{ item: modalItem }} bind:this={elModalAddEditNetwork} testId="wallet-settings-networks-edit-network" />
<Modal title="Token list" body={ModalTokenList} params={{ item: modalItemID }} bind:this={elModalTokenList} testId="wallet-settings-networks-token-list" />
<Modal title="Import networks" body={SettingsNetworksImport} bind:this={elModalSettingsNetworksImport} testId="wallet-settings-networks-import" />
<Modal title="Export networks" body={SettingsNetworksExport} bind:this={elModalSettingsNetworksExport} testId="wallet-settings-networks-export" />
<DialogDeleteNetwork item={modalItem || undefined} bind:this={elDialogDeleteNetwork} />
