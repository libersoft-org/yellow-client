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
	import { getContext } from 'svelte';
	let selectedWallet: IWallet | undefined = $state();
	let elWindowWalletsWallet: Window | undefined;
	let elWindowRecover: Window | undefined;
	let elWindowWalletsEdit: Window | undefined;
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
		elWindowWalletsEdit?.open();
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
		color: var(--primary-foreground);
		user-select: none;
	}

	.drag-handle:active {
		cursor: grabbing;
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
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th></Th>
				<Th>Name</Th>
				<Th align="center">Addresses</Th>
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
					<Td padding="0" expand>
						<Clickable onClick={() => clickWallet(item.wallet)}>
							<div class="item">{item.wallet.name}</div>
						</Clickable>
					</Td>
					<Td padding="0" align="center">
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
<Window title="Recover wallet from seed" body={WindowRecover} bind:this={elWindowRecover} />
<Window title="Edit wallet name" body={WindowWalletsEdit} params={{ wallet: selectedWallet }} bind:this={elWindowWalletsEdit} />
<Window title="Wallet details" body={WindowWalletsWallet} params={{ wallet: selectedWallet }} bind:this={elWindowWalletsWallet} />
{#if selectedWallet}
	<DialogWalletsDel wallet={selectedWallet} bind:this={elDialogWalletsDel} />
{/if}
