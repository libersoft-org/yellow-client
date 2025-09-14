<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { tableDrag } from '@/core/actions/tableDrag.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { wallets, type IWallet, reorderWallets, isHardwareWallet, isTrezorWallet } from 'libersoft-crypto/wallet';
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
	import Input from '@/core/components/Input/Input.svelte';
	import { isHwWalletActive } from 'libersoft-crypto/trezor';
	let selectedWallet: IWallet | undefined = $state();
	let elDialogWalletsDel: DialogWalletsDel | undefined = $state();
	let filter = $state('');
	let filteredWallets = $derived(($wallets || []).filter(wallet => wallet.name.toLowerCase().includes(filter.toLowerCase())));
	let elFilter: Input | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	export function onOpen(): void {
		elFilter?.focus();
	}

	function clickWallet(wallet: IWallet) {
		//console.log('CLICKWALLET', wallet);
		setSettingsSection('wallets-' + wallet.guid);
	}

	async function delWallet(wallet: IWallet): Promise<void> {
		selectedWallet = wallet;
		await tick();
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		setSettingsSection('wallets-edit-' + wallet.guid);
	}

	function handleWalletReorder(sourceIndex: number, targetIndex: number) {
		const reordered = [...filteredWallets];
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
	<Input placeholder="Filter wallets..." bind:value={filter} bind:this={elFilter} />
	<div use:tableDrag={{ items: filteredWallets, onReorder: handleWalletReorder }}>
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
				{#each filteredWallets as wallet, index (wallet.guid)}
					<TbodyTr>
						<Td>
							<DragHandle />
						</Td>
						<Td padding="0 10px" class="ellipsis ellipsis-50">
							<Clickable onClick={() => clickWallet(wallet)}>
								{wallet.name}
							</Clickable>
						</Td>
						<Td class="ellipsis ellipsis-50" padding="0" align="center">
							<Clickable onClick={() => clickWallet(wallet)}>
								<span class="td__row">
									<span class="td__icon">
										<Icon img={getWalletTypeIcon(wallet)} alt={getWalletTypeText(wallet)} colorVariable="--primary-foreground" size="16px" />
									</span>
									<span class="td__text">{getWalletTypeText(wallet)}</span>
									{#if isHwWalletActive(wallet)}
										<span class="td__icon">
											<Icon img="img/check.svg" alt="Connected" size="16px" />
										</span>
									{/if}
								</span>
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
