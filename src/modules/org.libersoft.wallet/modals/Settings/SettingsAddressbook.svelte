<script lang="ts">
	import { addressBook, type IAddressBookItem } from 'libersoft-crypto/addressbook';
	import { module } from '../../scripts/module.ts';
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
	import ModalAddEdit from '../../windows/Settings/SettingsAddressbookAddEdit.svelte';
	import DialogDelete from '../../dialogs/AddressbookDel.svelte';
	import ModalExport from '../../windows/Settings/SettingsAddressbookExport.svelte';
	import ModalImport from '../../windows/Settings/SettingsAddressbookImport.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';

	let modalItem: IAddressBookItem | null | undefined = $state();
	let elModalAddEdit: Window | undefined;
	let elModalExport: Window | undefined;
	let elModalImport: Window | undefined;
	let elDialogDel: DialogDelete | undefined = $state();

	function addToAddressBookModal() {
		modalItem = null;
		elModalAddEdit?.open();
	}

	function editItemModal(item: IAddressBookItem) {
		elModalAddEdit?.open(item);
	}

	function deleteItemModal(item) {
		modalItem = item;
		elDialogDel?.open();
	}

	function exportAddressBook() {
		elModalExport?.open();
	}

	function importAddressBook() {
		elModalImport?.open();
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
		<Button img="modules/{module.identifier}/img/address-add.svg" text="Add an address" onClick={addToAddressBookModal} />
		<Button img="img/import.svg" text="Import" onClick={importAddressBook} data-testid="import-button" />
		<Button img="img/export.svg" text="Export" onClick={exportAddressBook} data-testid="export-button" />
	</ButtonBar>
	{#if $addressBook.length > 0}
		<Table class="addressbook-table">
			<Thead>
				<TheadTr>
					<Th>Name</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each $addressBook as a, index (index + '/' + a.address)}
					<TbodyTr>
						<Td title="Name">
							<b>{a.name}</b>
						</Td>
						<Td title="Address">
							<div class="ellipsis"><span>{a.address}</span></div>
						</Td>
						<Td title="Action">
							<TableActionItems>
								<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => editItemModal(a)} />
								<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => deleteItemModal(a)} />
							</TableActionItems>
						</Td>
					</TbodyTr>
				{/each}
			</Tbody>
		</Table>
	{/if}
</div>
<Window title={modalItem ? 'Edit the item in address book' : 'Add a new item to address book'} body={ModalAddEdit} bind:this={elModalAddEdit} width="400px" />
<Window title="Import address book" body={ModalImport} params={{ close: () => elModalImport?.close() }} bind:this={elModalImport} width="600px" />
<Window title="Export address book" body={ModalExport} params={{ close: () => elModalExport?.close() }} bind:this={elModalExport} width="600px" />
{#if modalItem}
	<DialogDelete item={modalItem} bind:this={elDialogDel} />
{/if}
