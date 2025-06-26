<script lang="ts">
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
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalAddEdit from '../../modals/Addressbook/AddressbookAddEdit.svelte';
	import ModalDel from '../../modals/Addressbook/AddressbookDel.svelte';
	import ModalExport from '../../modals/Addressbook/AddressbookExport.svelte';
	import ModalImport from '../../modals/Addressbook/AddressbookImport.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { module } from '../../module.ts';
	import { addressBook } from '../../wallet.ts';
	let elModalAddEdit;
	let elModalDel;
	let elModalExport;
	let elModalImport;
	let edit = $state(false);
	let modalItem = $state(null);

	function addToAddressBookModal() {
		modalItem = null;
		edit = false;
		elModalAddEdit?.open();
	}

	function editItemModal(item) {
		console.log('EDIT ADDRESSBOOK ITEM:', item);
		modalItem = item;
		edit = true;
		elModalAddEdit?.open();
	}

	function deleteItemModal(item) {
		console.log('DELETE ADDRESSBOOK ITEM:', item);
		modalItem = item;
		elModalDel?.open();
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
		<Table breakpoint="0">
			<Thead>
				<TheadTr>
					<Th>Alias</Th>
					<Th>Address</Th>
					<Th>Action</Th>
				</TheadTr>
			</Thead>
			<Tbody>
				{#each $addressBook as a, index (index + '/' + a.address)}
					<TbodyTr>
						<Td title="Alias">
							<b>{a.alias}</b>
						</Td>
						<Td title="Address">
							{a.address}
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
<Modal title={edit ? 'Edit the item in address book' : 'Add a new item to address book'} body={ModalAddEdit} params={{ item: modalItem }} bind:this={elModalAddEdit} width="400px" />
<Modal title="Delete the item in address book" body={ModalDel} params={{ item: modalItem }} bind:this={elModalDel} width="400px" />
<Modal title="Import address book" body={ModalImport} params={{ close: () => elModalImport?.close() }} bind:this={elModalImport} width="600px" />
<Modal title="Export address book" body={ModalExport} params={{ close: () => elModalExport?.close() }} bind:this={elModalExport} width="600px" />
