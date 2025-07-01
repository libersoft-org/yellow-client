<script lang="ts">
	import { module } from '../../module.ts';
	import { wallets, type IAddress, type IWallet } from '../../wallet.ts';
	import Address from './SettingsWalletsAddress.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalWalletsAdd from '../Wallets/WalletsAdd.svelte';
	import ModalWalletsEdit from '../Wallets/WalletsEdit.svelte';
	import ModalAddressAdd from '../Wallets/WalletsAddressAdd.svelte';
	import DialogWalletsDel from '../../dialogs/WalletsDel.svelte';
	import DialogAddressDel from '../../dialogs/WalletsAddressDel.svelte';
	import ModalRecover from '../Wallets/WalletsRecover.svelte';
	let selectedWallet: IWallet | undefined;
	let selectedAddress: IAddress | undefined;
	let accordion: Accordion | undefined;
	let elModalWalletsAdd: Modal | undefined;
	let elModalRecover: Modal | undefined;
	let elModalWalletsEdit: Modal | undefined;
	let elDialogWalletsDel: DialogWalletsDel | undefined;
	let elModalAddressAdd: Modal | undefined;
	let elDialogAddressDel: DialogAddressDel | undefined;

	function delWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elDialogWalletsDel?.open();
	}

	function editWallet(wallet: IWallet) {
		selectedWallet = wallet;
		elModalWalletsEdit?.open();
	}

	function addAddress(wallet: IWallet) {
		selectedWallet = wallet;
		elModalAddressAdd?.open();
	}

	function renameAddress(wallet, address) {
		let name = window.prompt('Enter the new name');
		if (!name) return;
		address.name = name;
		wallet.addresses = [...wallet.addresses];
		wallets.update(ws =>
			ws.map(w =>
				w === wallet
					? {
							...w,
							addresses: (w.addresses || []).map(a => (a === address ? { ...a, name } : a)),
						}
					: w
			)
		);
	}

	function deleteAddress(wallet, address) {
		selectedWallet = wallet;
		selectedAddress = address;
		elDialogAddressDel?.open();
	}
</script>

<style>
	.wallet {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px 10px;
	}

	.wallet:global(:has(tbody:empty) table) {
		display: none !important;
	}
</style>

<ButtonBar equalize>
	<Button img="modules/{module.identifier}/img/wallet-add.svg" text="Add a new wallet" onClick={() => elModalWalletsAdd?.open()} />
	<Button img="modules/{module.identifier}/img/recover.svg" text="Recover from seed" onClick={() => elModalRecover?.open()} />
</ButtonBar>
{#if $wallets.length > 0}
	<div class="bold">My wallets:</div>
{/if}
{#if $wallets.length === 0}
	<div class="bold">No wallets found</div>
{/if}
<Accordion items={$wallets} bind:this={accordion}>
	{#snippet content(walleta)}
		<div class="wallet">
			<ButtonBar>
				<Button img="img/edit.svg" text="Edit wallet name" onClick={() => editWallet(walleta)} />
				<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add address" onClick={() => addAddress(walleta)} />
				<Button img="img/del.svg" text="Delete wallet" onClick={() => delWallet(walleta)} />
			</ButtonBar>
			<Table>
				<Thead>
					<Th>Index</Th>
					<Th>Name</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</Thead>
				<Tbody>
					{#each walleta.addresses as address}
						<TbodyTr>
							<Td title="Index">{address.index}</Td>
							<Td title="Name">{address.name}</Td>
							<Td title="Address"><Address address={address.address} /></Td>
							<Td title="Action">
								<TableActionItems>
									<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5" onClick={() => renameAddress(walleta, address)} />
									<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5" onClick={() => deleteAddress(walleta, address)} />
								</TableActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/snippet}
</Accordion>
<Modal title="Add a new wallet" body={ModalWalletsAdd} width="600px" bind:this={elModalWalletsAdd} />
<Modal title="Recover wallet from seed" body={ModalRecover} bind:this={elModalRecover} />
<Modal title="Edit wallet name" body={ModalWalletsEdit} params={{ wallet: selectedWallet }} bind:this={elModalWalletsEdit} />
<Modal title="Add a new address" body={ModalAddressAdd} params={{ wallet: selectedWallet }} width="600px" bind:this={elModalAddressAdd} />
{#if selectedWallet && selectedAddress}
	<DialogAddressDel wallet={selectedWallet} address={selectedAddress} bind:this={elDialogAddressDel} />
{/if}
{#if selectedWallet}
	<DialogWalletsDel wallet={selectedWallet} bind:this={elDialogWalletsDel} />
{/if}
