<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { tableDrag } from '@/core/actions/tableDrag.ts';
	import { addressBook, type IAddressBookItem, reorderAddressBook } from '@/org.libersoft.wallet/scripts/crypto-utils/addressbook';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import DragHandle from '@/core/components/Drag/DragHandle.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import DialogDelete from '@/org.libersoft.wallet/dialogs/AddressbookDel.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	let selectedItem: IAddressBookItem | null | undefined = $state();
	let elDialogDel: DialogDelete | undefined = $state();
	let filter = $state('');
	let filteredAddressBook = $derived($addressBook.filter(item => !item.name || item.name.toLowerCase().includes(filter.toLowerCase()) || item.address.toLowerCase().includes(filter.toLowerCase())));
	let elFilter: Input | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	export function onOpen(): void {
		elFilter?.focus();
	}

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

	function handleAddressBookReorder(sourceIndex: number, targetIndex: number) {
		const reordered = [...filteredAddressBook];
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(targetIndex, 0, moved);
		reorderAddressBook(reordered);
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
		<Input placeholder="Filter addresses..." bind:value={filter} bind:this={elFilter} />
		<div use:tableDrag={{ items: filteredAddressBook, onReorder: handleAddressBookReorder }}>
			<Table>
				<Thead>
					<TheadTr>
						<Th></Th>
						<Th>Name</Th>
						<Th>Address</Th>
						<Th align="center">Action</Th>
					</TheadTr>
				</Thead>
				<Tbody>
					{#each filteredAddressBook as a, index (a.guid)}
						<TbodyTr>
							<Td>
								<DragHandle />
							</Td>
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
		</div>
	{/if}
</div>
{#if selectedItem}
	<DialogDelete item={selectedItem} bind:this={elDialogDel} />
{/if}
