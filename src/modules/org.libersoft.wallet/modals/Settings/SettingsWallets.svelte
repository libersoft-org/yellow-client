<script lang="ts">
	import { module } from '../../module.ts';
	import { wallets, type IAddress, type IWallet, reorderWallets } from '../../wallet.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
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
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalWalletsWallet from './SettingsWalletsWallet.svelte';

	import ModalRecover from '../Wallets/WalletsRecover.svelte';
	import ModalWalletsEdit from '../Wallets/WalletsEdit.svelte';
	import DialogWalletsDel from '../../dialogs/WalletsDel.svelte';
	import { getContext } from 'svelte';
	let selectedWallet: IWallet | undefined = $state();
	let elModalWalletsWallet: Modal | undefined;

	let elModalRecover: Modal | undefined;
	let elModalWalletsEdit: Modal | undefined;
	let elDialogWalletsDel: DialogWalletsDel | undefined = $state();

	const setSettingsSection = getContext<Function>('setSettingsSection');

	// Transform wallets into items with unique IDs for drag-and-drop
	let dndItems = $state(
		$wallets.map(wallet => ({
			id: wallet.address,
			wallet: wallet,
		}))
	);

	// Update dndItems when wallets change (but not during drag operations)
	let isDragging = $state(false);
	$effect(() => {
		if (!isDragging) {
			dndItems = $wallets.map(wallet => ({
				id: wallet.address,
				wallet: wallet,
			}));
		}
	});

	async function clickWallet(wallet: IWallet) {
		await setSettingsSection('wallets-' + wallet.address);
	}

	function delWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elModalWalletsEdit?.open();
	}

	function handleDndConsider(e) {
		isDragging = true;
		dndItems = e.detail.items;
	}

	function handleDndFinalize(e) {
		isDragging = false;
		dndItems = e.detail.items;
		// Update the store with the reordered wallets
		const reorderedWallets = dndItems.map(item => item.wallet);
		reorderWallets(reorderedWallets);
	}
</script>

<style>
	.item {
		padding: 10px;
		min-height: 40px;
		box-sizing: border-box;
	}

	.drag-handle {
		cursor: grab;
		padding: 0 5px;
		color: #666;
		user-select: none;
	}

	.drag-handle:hover {
		color: #333;
	}

	.drag-handle:active {
		cursor: grabbing;
	}
</style>

<ButtonBar equalize>
	<Button img="modules/{module.identifier}/img/wallet-add.svg" text="Add a new wallet" onClick={() => setSettingsSection('wallets-add')} />
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover from seed" onClick={() => elModalRecover?.open()} />
</ButtonBar>
{#if $wallets?.length === 0}
	<div class="bold">No wallets found</div>
{/if}
{#if $wallets?.length > 0}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th></Th>
				<Th>Name</Th>
				<Th>Addresses</Th>
				<Th>Action</Th>
			</TheadTr>
		</Thead>
		<Tbody
			dndzone={{
				items: dndItems,
				flipDurationMs: 200,
				dropTargetStyle: {},
			}}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each dndItems as item (item.id)}
				<TbodyTr>
					<Td padding="5px" style="width: 30px;">
						<div class="drag-handle">⋮⋮</div>
					</Td>
					<Td padding="0">
						<Clickable onClick={() => clickWallet(item.wallet)}>
							<div class="item">{item.wallet.name}</div>
						</Clickable>
					</Td>
					<Td padding="0">
						<Clickable onClick={() => clickWallet(item.wallet)}>
							<div class="item">{item.wallet?.addresses?.length || '0'}</div>
						</Clickable>
					</Td>
					<Td padding="0">
						<TableActionItems>
							<Icon img="modules/{module.identifier}/img/wallet-address.svg" alt="Addresses" size="20px" padding="5px" onClick={() => clickWallet(item.wallet)} />
							<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit" size="20px" padding="5px" onClick={() => editWallet(item.wallet)} />
							<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => delWallet(item.wallet)} />
						</TableActionItems>
					</Td>
				</TbodyTr>
			{/each}
		</Tbody>
	</Table>
{/if}
<Modal title="Recover wallet from seed" body={ModalRecover} bind:this={elModalRecover} />
<Modal title="Edit wallet name" body={ModalWalletsEdit} params={{ wallet: selectedWallet }} bind:this={elModalWalletsEdit} />
<Modal title="Wallet details" body={ModalWalletsWallet} params={{ wallet: selectedWallet }} bind:this={elModalWalletsWallet} />
{#if selectedWallet}
	<DialogWalletsDel wallet={selectedWallet} bind:this={elDialogWalletsDel} />
{/if}
