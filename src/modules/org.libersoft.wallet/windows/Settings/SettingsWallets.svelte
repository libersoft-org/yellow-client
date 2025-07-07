<script lang="ts">
	import { module } from '../../scripts/module.ts';
	import { wallets, type IWallet, reorderWallets } from '../../scripts/wallet.ts';
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
	import Window from '@/core/components/Window/Window.svelte';
	import WindowWalletsWallet from './SettingsWalletsWallet.svelte';
	import WindowRecover from '../Wallets/WalletsRecover.svelte';
	import WindowWalletsEdit from '../Wallets/WalletsEdit.svelte';
	import DialogWalletsDel from '../../dialogs/WalletsDel.svelte';
	import { getContext, onMount, onDestroy } from 'svelte';
	import { TableDragManager, type DragConfig } from '@/core/scripts/drag.ts';
	let selectedWallet: IWallet | undefined = $state();
	let elWindowWalletsWallet: Window | undefined;
	let elWindowRecover: Window | undefined;
	let elWindowWalletsEdit: Window | undefined;
	let elDialogWalletsDel: DialogWalletsDel | undefined = $state();
	let dragManager: TableDragManager | undefined;
	let tableContainer: HTMLElement | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');
	// Initialize drag manager when table is mounted and wallets are available
	$effect(() => {
		if ($wallets?.length > 0 && tableContainer) {
			// Find tbody within our table container
			const tbody = tableContainer.querySelector('tbody');
			if (tbody && !dragManager) {
				console.log('Initializing drag manager for tbody:', tbody); // Debug log
				const config: DragConfig = {
					dragHandleSelector: '.drag-handle',
					columnCount: 4,
					onReorder: (sourceIndex: number, targetIndex: number) => {
						console.log('Reordering from', sourceIndex, 'to', targetIndex); // Debug log
						const reordered = [...$wallets];
						const [moved] = reordered.splice(sourceIndex, 1);
						reordered.splice(targetIndex, 0, moved);
						reorderWallets(reordered);
					},
				};
				dragManager = new TableDragManager(config);
				dragManager.init(tbody);
			}
		}
	});

	onDestroy(() => {
		if (dragManager) {
			dragManager.destroy();
			dragManager = undefined;
		}
	});

	function clickWallet(wallet: IWallet) {
		setSettingsSection('wallets-' + wallet.address);
	}

	function delWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elWindowWalletsEdit?.open();
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
		color: var(--primary-foreground);
		user-select: none;
		transition: color 0.2s ease;
	}

	.drag-handle:hover {
		color: var(--primary);
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	/* Gap elements for drag and drop */
	:global(tr.drop-gap) {
		background: transparent !important;
		border: none !important;
	}

	:global(tr.drop-gap td) {
		border: none !important;
		padding: 0 !important;
	}

	:global(.drop-indicator) {
		height: 30px !important;
		background: rgba(var(--primary-rgb, 74, 144, 226), 0.1) !important;
		border: 2px dashed var(--primary) !important;
		border-radius: 4px !important;
		margin: 2px 4px !important;
		display: block !important;
	}
</style>

<ButtonBar equalize>
	<Button img="modules/{module.identifier}/img/wallet-add.svg" text="Add a new wallet" onClick={() => setSettingsSection('wallets-add')} />
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover from seed" onClick={() => elWindowRecover?.open()} />
</ButtonBar>
{#if $wallets?.length === 0}
	<div class="bold">No wallets found</div>
{/if}
{#if $wallets?.length > 0}
	<div bind:this={tableContainer}>
		<Table breakpoint="0">
			<Thead>
				<TheadTr>
					<Th></Th>
					<Th>Name</Th>
					<Th align="center">Addresses</Th>
					<Th>Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each $wallets as wallet, index (wallet.address)}
					<TbodyTr>
						<Td padding="5px" style="width: 30px;">
							<div class="drag-handle" role="button" tabindex="0">⋮⋮</div>
						</Td>
						<Td padding="0" expand>
							<Clickable onClick={() => clickWallet(wallet)}>
								<div class="item">{wallet.name}</div>
							</Clickable>
						</Td>
						<Td padding="0" align="center">
							<Clickable onClick={() => clickWallet(wallet)}>
								<div class="item">{wallet?.addresses?.length || '0'}</div>
							</Clickable>
						</Td>
						<Td padding="0">
							<TableActionItems>
								<Icon img="modules/{module.identifier}/img/wallet-address.svg" alt="Addresses" size="20px" padding="5px" onClick={() => clickWallet(wallet)} />
								<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit" size="20px" padding="5px" onClick={() => editWallet(wallet)} />
								<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => delWallet(wallet)} />
							</TableActionItems>
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	</div>
{/if}
<Window title="Recover wallet from seed" body={WindowRecover} bind:this={elWindowRecover} />
<Window title="Edit wallet name" body={WindowWalletsEdit} params={{ wallet: selectedWallet }} bind:this={elWindowWalletsEdit} />
<Window title="Wallet details" body={WindowWalletsWallet} params={{ wallet: selectedWallet }} bind:this={elWindowWalletsWallet} />
{#if selectedWallet}
	<DialogWalletsDel wallet={selectedWallet} bind:this={elDialogWalletsDel} />
{/if}
