<script lang="ts">
	import { module } from '../../module.ts';
	import { wallets, type IWallet, type IAddress } from '../../wallet.ts';
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
	import Address from './SettingsWalletsAddress.svelte';
	import ModalAddressAdd from '../Wallets/WalletsAddressAdd.svelte';
	import DialogAddressDel from '../../dialogs/WalletsAddressDel.svelte';
	interface Props {
		params: {
			wallet: IWallet;
		};
	}
	let { params }: Props = $props();
	let elModalAddressAdd: Modal | undefined;
	let elDialogAddressDel: DialogAddressDel | undefined = $state();
	let selectedAddress: IAddress | undefined = $state();

	export function onOpen() {
		console.log('[EFFECT] SettingsWalletsWallet opened for wallet:', $state.snapshot(params.wallet));
		window.alert('This is a placeholder for the wallet settings. You can manage addresses here.');
	}

	function addAddress() {
		console.log('Adding address to wallet', $state.snapshot(params.wallet));
		elModalAddressAdd?.open();
	}

	function renameAddress(address: IAddress) {
		let name = window.prompt('Enter the new name');
		if (!name) return;
		address.name = name;
		if (params.wallet.addresses) params.wallet.addresses = [...params.wallet.addresses];
		wallets.update(ws =>
			ws.map(w =>
				w === params.wallet
					? {
							...w,
							addresses: (w.addresses || []).map(a => (a === address ? { ...a, name } : a)),
						}
					: w
			)
		);
	}

	function deleteAddress(address: IAddress) {
		selectedAddress = address;
		elDialogAddressDel?.open();
	}
</script>

<style>
	.wallet {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="wallet">
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add address" onClick={() => addAddress()} />
	</ButtonBar>
	<div>
		<span class="bold">Wallet:</span>
		<span>{params.wallet.name}</span>
	</div>
	{#if params.wallet?.addresses}
		<Table>
			<Thead>
				<TheadTr>
					<Th>Index</Th>
					<Th>Name</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each params.wallet.addresses as address}
					<TbodyTr>
						<Td title="Index">{address.index}</Td>
						<Td title="Name">{address.name}</Td>
						<Td title="Address"><Address address={address.address} /></Td>
						<Td title="Action">
							<TableActionItems>
								<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5" onClick={() => renameAddress(address)} />
								<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5" onClick={() => deleteAddress(address)} />
							</TableActionItems>
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
<Modal title="Add a new address" body={ModalAddressAdd} params={{ wallet: params.wallet }} width="600px" bind:this={elModalAddressAdd} />
{#if params.wallet && selectedAddress}
	<DialogAddressDel wallet={params.wallet} address={selectedAddress} bind:this={elDialogAddressDel} />
{/if}
