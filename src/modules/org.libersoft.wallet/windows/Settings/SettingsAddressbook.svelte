<script lang="ts">
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
	import Window from '@/core/components/Window/Window.svelte';
	import WindowAddEdit from '@/org.libersoft.wallet/windows/Addressbook/AddressbookAddEdit.svelte';
	import DialogDelete from '@/org.libersoft.wallet/dialogs/AddressbookDel.svelte';
	import WindowExport from '@/org.libersoft.wallet/windows/Addressbook/AddressbookExport.svelte';
	import WindowImport from '@/org.libersoft.wallet/windows/Addressbook/AddressbookImport.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let windowItem: IAddressBookItem | null | undefined = $state();
	let elWindowAddEdit: Window | undefined;
	let elWindowExport: Window | undefined;
	let elWindowImport: Window | undefined;
	let elDialogDel: DialogDelete | undefined = $state();

	function addToAddressBookWindow(): void {
		windowItem = null;
		elWindowAddEdit?.open();
	}

	function editItemWindow(item: IAddressBookItem): void {
		elWindowAddEdit?.open(item);
	}

	function deleteItemWindow(item: IAddressBookItem): void {
		windowItem = item;
		elDialogDel?.open();
	}

	function exportAddressBook(): void {
		elWindowExport?.open();
	}

	function importAddressBook(): void {
		elWindowImport?.open();
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
		<Button img="modules/{module.identifier}/img/address-add.svg" text="Add an address" onClick={addToAddressBookWindow} />
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
								<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => editItemWindow(a)} />
								<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => deleteItemWindow(a)} />
							</TableActionItems>
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
<Window title={windowItem ? 'Edit the item in address book' : 'Add a new item to address book'} body={WindowAddEdit} bind:this={elWindowAddEdit} width="400px" />
<Window title="Import address book" body={WindowImport} params={{ close: () => elWindowImport?.close() }} bind:this={elWindowImport} width="600px" />
<Window title="Export address book" body={WindowExport} params={{ close: () => elWindowExport?.close() }} bind:this={elWindowExport} width="600px" />
{#if windowItem}
	<DialogDelete item={windowItem} bind:this={elDialogDel} />
{/if}
