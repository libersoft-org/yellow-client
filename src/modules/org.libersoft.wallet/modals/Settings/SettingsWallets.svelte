<script lang="ts">
	import { module } from '../../module.ts';
	import { wallets, type IAddress, type IWallet } from '../../wallet.ts';
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
	let selectedWallet: IWallet | undefined;
	let elModalWalletsWallet: Modal | undefined;

	let elModalRecover: Modal | undefined;
	let elModalWalletsEdit: Modal | undefined;
	let elDialogWalletsDel: DialogWalletsDel | undefined;

	const setSettingsSection = getContext<Function>('setSettingsSection');

	async function clickWallet(wallet: IWallet) {
		selectedWallet = wallet;
		console.log('Opening wallet details for', wallet);
		//elModalWalletsWallet?.open();
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
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover from seed" onClick={() => elModalRecover?.open()} />
</ButtonBar>
{#if $wallets?.length > 0}
	<div class="bold">My wallets:</div>
{/if}
{#if $wallets?.length === 0}
	<div class="bold">No wallets found</div>
{/if}
{#if $wallets?.length > 0}
	<Table breakpoint="0">
		<Thead>
			<TheadTr>
				<Th>Name</Th>
				<Th>Addresses</Th>
				<Th>Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			{#each $wallets as w, index}
				<TbodyTr>
					<Td padding="0">
						<Clickable onClick={() => clickWallet(w)}>
							<div class="item">{w.name}</div>
						</Clickable>
					</Td>
					<Td>{w?.addresses?.length || '?'}</Td>
					<Td padding="0">
						<TableActionItems>
							<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Edit" size="20px" padding="5px" onClick={() => editWallet(w)} />
							<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => delWallet(w)} />
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
