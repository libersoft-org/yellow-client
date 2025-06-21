<script>
	import { module } from '../../module.ts';
	import { addNetwork, removeNetwork, networks, default_networks } from '../../wallet.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import ModalEditNetwork from '../../modals/EditNetwork.svelte';
	import ModalTokenList from '../../modals/TokenList.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import SettingsNetworksExport from './SettingsNetworksExport.svelte';
	import SettingsNetworksImport from './SettingsNetworksImport.svelte';
	let showModalEditNetwork = false;
	let showModalTokenList = false;
	let modalItemID = null;
	let modalItem = null;
	let showSettingsNetworksExport = false;
	let showSettingsNetworksImport = false;

	function clickAddNetwork(net) {
		console.log('clickAddNetwork', net);
		//TODO
	}

	function editNetwork(net) {
		console.log('editNetwork', net);
		modalItem = net;
		showModalEditNetwork = true;
	}

	function tokenList(net) {
		console.log('tokenList', net);
		modalItemID = net.guid;
		showModalTokenList = true;
	}

	function doExport() {
		showSettingsNetworksExport = true;
	}

	function doImport() {
		showSettingsNetworksImport = true;
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
		<Button img="modules/{module.identifier}/img/network-add.svg" text="Add a network" onClick={clickAddNetwork} data-testid="networks-export-btn" />
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
							<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit network" size="20px" padding="5px" onClick={() => editNetwork(n)} />
							<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete network" size="20px" padding="5px" onClick={() => removeNetwork(n)} />
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
							<Icon img="img/add.svg" alt="Add to my networks" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => addNetwork(n)} />
						</TableActionItems>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
</div>
<Modal title="Edit network" body={ModalEditNetwork} params={{ item: modalItem }} bind:show={showModalEditNetwork} />
<Modal title="Token list" body={ModalTokenList} params={{ item: modalItemID }} bind:show={showModalTokenList} />
<Modal title="Export networks" body={SettingsNetworksExport} bind:show={showSettingsNetworksExport} />
<Modal title="Import networks" body={SettingsNetworksImport} bind:show={showSettingsNetworksImport} />
