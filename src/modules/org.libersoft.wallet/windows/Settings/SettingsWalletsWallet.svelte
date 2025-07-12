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

	function addAddress() {
		elWindowAddressAdd?.open();
	}

	function editAddress(index: string | number) {
		elWindowAddressEdit?.open(params.wallet, index);
	}

	function deleteAddress(index: string | number) {
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
		{#each params.wallet.addresses as address}
			<Table>
				<Thead>
					<TheadTr>
						<Th>{address.name}</Th>
						<Th padding="0 10px">
							<TableActionItems align="right">
								<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5px" onClick={() => editAddress(address.index)} />
								<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => deleteAddress(address.index)} />
							</TableActionItems>
						</Th>
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
