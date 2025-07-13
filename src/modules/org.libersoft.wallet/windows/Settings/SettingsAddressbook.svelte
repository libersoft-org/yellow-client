<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { addressBook, type IAddressBookItem } from '@/org.libersoft.wallet/scripts/addressbook.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
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
	import DialogDelete from '@/org.libersoft.wallet/dialogs/AddressbookDel.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let selectedItem: IAddressBookItem | null | undefined = $state();
	let elDialogDel: DialogDelete | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function addEditItem(item?: IAddressBookItem): void {
		setSettingsSection(item ? 'addressbook-edit-' + item.guid : 'addressbook-add');
	}

	async function deleteItemWindow(item: IAddressBookItem): Promise<void> {
		selectedItem = item;
		await tick();
		elDialogDel?.open();
	}

	function exportAddressBook(): void {
		setSettingsSection('addressbook-export');
	}

	function importAddressBook(): void {
		setSettingsSection('addressbook-import');
	}
</script>

<style>
	.addressbook {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="addressbook">
	<ButtonBar>
		<Button img="modules/{module.identifier}/img/address-add.svg" text="Add an address" onClick={() => addEditItem()} />
		<Button img="img/import.svg" text="Import" onClick={importAddressBook} data-testid="import-button" />
		<Button img="img/export.svg" text="Export" onClick={exportAddressBook} data-testid="export-button" />
	</ButtonBar>
	{#if $addressBook.length > 0}
		<Table>
			<Thead>
				<TheadTr>
					<Th>Name</Th>
					<Th>Address</Th>
					<Th align="center">Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each $addressBook as a, index (index + '/' + a.address)}
					<TbodyTr>
						<Td bold>{a.name}</Td>
						<Td shorten>{a.address}</Td>
						<Td>
							<TableActionItems align="center">
								<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => addEditItem(a)} />
								<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => deleteItemWindow(a)} />
							</TableActionItems>
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
{#if selectedItem}
	<DialogDelete item={selectedItem} bind:this={elDialogDel} />
{/if}
