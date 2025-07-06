<script lang="ts">
	import { module } from '../../scripts/module.ts';
	import { type IWallet } from '../../scripts/wallet.ts';
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
	import Address from './SettingsWalletsAddress.svelte';
	import WindowAddressAdd from '../Wallets/WalletsAddressAdd.svelte';
	import WindowAddressEdit from '../Wallets/WalletsAddressEdit.svelte';
	import DialogAddressDel from '../../dialogs/WalletsAddressDel.svelte';
	interface Props {
		params: {
			wallet: IWallet;
		};
	}
	let { params }: Props = $props();
	let elWindowAddressAdd: Window | undefined = $state();
	let elWindowAddressEdit: Window | undefined = $state();
	let elDialogAddressDel: DialogAddressDel | undefined = $state();

	export function onOpen() {
		console.log('onOpen SettingsWalletsWallet, wallet:', $state.snapshot(params.wallet));
	}

	function addAddress() {
		console.log('Adding address to wallet', $state.snapshot(params.wallet));
		elWindowAddressAdd?.open();
	}

	function editAddress(index: string | number) {
		elWindowAddressEdit?.open(params.wallet, index);
	}

	function deleteAddress(index: string | number) {
		console.log('Deleting address from wallet', elDialogAddressDel, index, params.wallet);
		elDialogAddressDel?.open(params.wallet, index);
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
	{#if params?.wallet?.addresses && params.wallet.addresses.length > 0}
		<!--<Table>
			<Thead>
				<TheadTr>
					<Th>Index</Th>
					<Th>Name</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</TheadTr>
			</Thead>
			-->

		{#each params.wallet.addresses as address}
			<Table>
				<Thead>
					<TheadTr>
						<Th colspan="2">{address.name}</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					<TbodyTr>
						<Td bold>Index:</Td>
						<Td>{address.index}</Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Address:</Td>
						<Td><Address address={address.address} /></Td>
					</TbodyTr>
					<TbodyTr>
						<Td bold>Action:</Td>
						<Td>
							<TableActionItems>
								<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5" onClick={() => editAddress(address.index)} />
								<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5" onClick={() => deleteAddress(address.index)} />
							</TableActionItems>
						</Td>
					</TbodyTr>
				</Tbody>
			</Table>
		{/each}
	{:else}
		<div class="bold">No addresses found in this wallet.</div>
	{/if}
</div>
<Window title="Add a new address" body={WindowAddressAdd} params={{ wallet: params.wallet }} width="600px" bind:this={elWindowAddressAdd} />
<Window title="Edit address" body={WindowAddressEdit} bind:this={elWindowAddressEdit} />
<DialogAddressDel bind:this={elDialogAddressDel} />
