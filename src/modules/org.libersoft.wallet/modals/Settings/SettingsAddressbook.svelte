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
	import ModalAddEdit from '../../modals/AddressbookAddEdit.svelte';
	import ModalDel from '../../modals/AddressbookDel.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { module } from '../../module.js';
	import { addressBook } from '../../wallet.ts';
	import { get } from 'svelte/store';
	let showModalAddEdit = $state(false);
	let showModalDel = $state(false);
	let edit = $state(false);
	let modalItem = $state(null);

	function addToAddressBookModal() {
		modalItem = null;
		edit = false;
		showModalAddEdit = true;
	}

	function editItemModal(item) {
		console.log('EDIT ADDRESSBOOK ITEM:', item);
		modalItem = item;
		edit = true;
		showModalAddEdit = true;
	}

	function deleteItemModal(item) {
		console.log('DELETE ADDRESSBOOK ITEM:', item);
		modalItem = item;
		showModalDel = true;
	}

	function exportAddressBook() {
		console.log('EXPORT ADDRESSBOOK');
		let data = get(addressBook);
		let json = JSON.stringify(data, null, 2);
		console.log('EXPORTED ADDRESSBOOK:', json);
		window.prompt('Copy the exported address book:', json);
	}

	function importAddressBook() {
		console.log('IMPORT ADDRESSBOOK');
		let json = window.prompt('Paste the exported address book here:');
		if (json) {
			try {
				let data = JSON.parse(json);
				console.log('IMPORTED ADDRESSBOOK:', data);
				addressBook.set(data);
			} catch (e) {
				console.error('IMPORT ADDRESSBOOK ERROR:', e);
			}
		}
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
		<Button img="modules/{module.identifier}/img/address-add.svg" colorVariable="--primary-foreground" text="Add an address" onClick={addToAddressBookModal} />
		<Button img="img/export.svg" colorVariable="--primary-foreground" text="Export" onClick={exportAddressBook} />
		<Button img="img/import.svg" colorVariable="--primary-foreground" text="Import" onClick={importAddressBook} />
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

<Modal title={edit ? 'Edit the item in address book' : 'Add a new item to address book'} body={ModalAddEdit} params={{ item: modalItem }} bind:show={showModalAddEdit} width="400px" />
<Modal title="Delete the item in address book" body={ModalDel} params={{ item: modalItem }} bind:show={showModalDel} width="400px" />
