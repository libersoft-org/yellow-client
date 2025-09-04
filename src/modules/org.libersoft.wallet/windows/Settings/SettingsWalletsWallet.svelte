<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { type IWallet, reorderAddresses } from 'libersoft-crypto/wallet';
	import { tableDrag } from '@/core/actions/tableDrag.ts';
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
	import DragHandle from '@/core/components/Drag/DragHandle.svelte';
	import Address from './SettingsWalletsAddress.svelte';
	import DialogAddressDel from '../../dialogs/WalletsAddressDel.svelte';
	interface Props {
		params: {
			wallet: IWallet;
		};
	}
	let { params }: Props = $props();
	let elDialogAddressDel: DialogAddressDel | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function addAddress() {
		setSettingsSection('wallets-address-add-' + params.wallet.guid);
	}

	function editAddress(index: string | number) {
		setSettingsSection('wallets-address-edit-' + params.wallet.guid + '-' + index);
	}

	function deleteAddress(index: string | number) {
		elDialogAddressDel?.open(params.wallet, index);
	}

	function handleAddressReorder(sourceIndex: number, targetIndex: number): void {
		if (!params.wallet?.addresses) return;

		const reordered = [...params.wallet.addresses];
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(targetIndex, 0, moved);
		reorderAddresses(params.wallet, reordered);
	}

	function openExport() {
		setSettingsSection('wallets-wallet-export-' + params.wallet.guid);
	}
</script>

<style>
	.wallet {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.info {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 0;
	}

	.info .details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.info .details .name {
		font-weight: bold;
	}

	.info .details .address {
		font-size: 12px;
	}
</style>

<div class="wallet">
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add address" onClick={addAddress} />
		<Button img="img/export.svg" text="Export" onClick={() => openExport()} />
	</ButtonBar>
	{#if $debug}
		<pre>
			<code>{JSON.stringify(params?.wallet, null, 2)}</code>
		</pre>
	{/if}
	{#if params?.wallet?.addresses && params.wallet.addresses.length > 0}
		<div use:tableDrag={{ items: params.wallet.addresses, onReorder: handleAddressReorder }}>
			<Table>
				<Thead>
					<TheadTr>
						<Th></Th>
						<Th>Address</Th>
						<Th>Actions</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each params.wallet.addresses as address, i (address.index)}
						<TbodyTr>
							<Td>
								<DragHandle />
							</Td>
							<Td expand class="ellipsis">
								<div class="info">
									<div class="details">
										<div class="name">{address.name} (ID: {address.index})</div>
										<div class="address"><Address address={address.address} /></div>
									</div>
								</div>
							</Td>
							<Td>
								<TableActionItems align="right">
									<Icon img="img/edit.svg" colorVariable="--primary-foreground" alt="Rename" size="20px" padding="5px" onClick={() => editAddress(address.index)} />
									<Icon img="img/del.svg" colorVariable="--primary-foreground" alt="Delete" size="20px" padding="5px" onClick={() => deleteAddress(address.index)} />
								</TableActionItems>
							</Td>
						</TbodyTr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{:else}
		<div class="bold">No addresses found in this wallet.</div>
	{/if}
</div>
<DialogAddressDel bind:this={elDialogAddressDel} />
