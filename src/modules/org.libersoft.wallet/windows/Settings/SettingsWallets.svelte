<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { tableDrag } from '@/core/actions/tableDrag.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { wallets, type IWallet, reorderWallets, isHardwareWallet, isTrezorWallet } from '@/org.libersoft.wallet/scripts/wallet.ts';
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
	import DragHandle from '@/core/components/Drag/DragHandle.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import DialogWalletsDel from '@/org.libersoft.wallet/dialogs/WalletsDel.svelte';
	let selectedWallet: IWallet | undefined = $state();
	let elDialogWalletsDel: DialogWalletsDel | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function clickWallet(wallet: IWallet) {
		setSettingsSection('wallets-' + wallet.address);
	}

	async function delWallet(wallet: IWallet): Promise<void> {
		selectedWallet = wallet;
		await tick();
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		setSettingsSection('wallets-edit-' + wallet.address);
	}

	function handleWalletReorder(sourceIndex: number, targetIndex: number) {
		const reordered = [...$wallets];
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(targetIndex, 0, moved);
		reorderWallets(reordered);
	}

	function getWalletTypeIcon(wallet: IWallet): string {
		if (wallet.type === 'trezor') return `modules/${module.identifier}/img/wallet-trezor.svg`;
		else if (wallet.type === 'ledger') return `modules/${module.identifier}/img/wallet-ledger.svg`;
		else return `modules/${module.identifier}/img/wallet.svg`;
	}

	function getWalletTypeText(wallet: IWallet): string {
		if (wallet.type === 'trezor') return 'Trezor';
		else if (wallet.type === 'ledger') return 'Ledger';
		else return 'Software';
	}
</script>

<style>
	.item {
		padding: 10px;
		min-height: 40px;
		box-sizing: border-box;
	}
</style>

<ButtonBar equalize>
	<Button img="modules/{module.identifier}/img/wallet-add.svg" text="Add a new wallet" onClick={() => setSettingsSection('wallets-add')} />
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover from seed" onClick={() => setSettingsSection('wallets-recover')} />
</ButtonBar>
{#if $wallets?.length === 0}
	<div class="bold">No wallets found</div>
{/if}
{#if $wallets?.length > 0}
	<div use:tableDrag={{ items: $wallets, onReorder: handleWalletReorder }}>
		<Table breakpoint="0">
			<Thead>
				<TheadTr>
					<Th></Th>
					<Th>Name</Th>
					<Th align="center">Type</Th>
					<Th align="center">Addresses</Th>
					<Th align="center">Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each $wallets as wallet, index (wallet.address)}
					<TbodyTr>
						<Td>
							<DragHandle />
						</Td>
						<Td padding="0" expand>
							<Clickable onClick={() => clickWallet(wallet)}>
								<div class="item">{wallet.name}</div>
							</Clickable>
						</Td>
						<Td padding="0" align="center">
							<Clickable onClick={() => clickWallet(wallet)}>
								<div class="item" style="display: flex; align-items: center; justify-content: center; gap: 5px;">
									<Icon img={getWalletTypeIcon(wallet)} size="16px" />
									<span>{getWalletTypeText(wallet)}</span>
								</div>
							</Clickable>
						</Td>
						<Td padding="0" align="center">
							<Clickable onClick={() => clickWallet(wallet)}>
								<div class="item">{wallet?.addresses?.length || '0'}</div>
							</Clickable>
						</Td>
						<Td padding="0 10px">
							<TableActionItems align="center">
								<Icon img="modules/{module.identifier}/img/wallet-address.svg" colorVariable="--primary-foreground" alt="Addresses" size="20px" padding="5px" onClick={() => clickWallet(wallet)} />
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
{#if selectedWallet}
	<DialogWalletsDel wallet={selectedWallet} bind:this={elDialogWalletsDel} />
{/if}
