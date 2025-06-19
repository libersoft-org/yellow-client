<script lang="ts">
	import { findAccount, accounts_config, setCorePage } from '@/core/core.ts';
	import { hideSidebarMobile } from '@/core/stores.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import TableActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalAccountsAddEdit from '@/core/modals/Accounts/AccountsAddEdit.svelte';
	import ModalAccountsDelete from '@/core/modals/Accounts/AccountsDelete.svelte';
	import ModalAccountsExport from '@/core/modals/Accounts/AccountsExport.svelte';
	import ModalAccountsImport from '@/core/modals/Accounts/AccountsImport.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';
	let showAddEditAccountModal: boolean = $state(false);
	let showDelAccountModal: boolean = $state(false);
	let showExportModal: boolean = $state(false);
	let showImportModal: boolean = $state(false);
	let idItem: string | null = $state(null);
	let modalKey: number = $state(0);

	$effect(() => {
		console.log('[AccountsContent] idItem:', idItem);
	});

	function back() {
		hideSidebarMobile.set(false);
		setCorePage(null);
	}

	function addAccountModal() {
		idItem = null;
		modalKey++; // Force modal component to recreate
		console.log('[AccountsContent] Opening Add/Edit Account modal, idItem set to', idItem, 'modalKey:', modalKey);
		showAddEditAccountModal = true;
	}

	function clickEdit(id: string) {
		idItem = id;
		showAddEditAccountModal = true;
	}

	const clickDel = (id: string) => {
		idItem = id;
		showDelAccountModal = true;
	};

	function clickExport() {
		showExportModal = true;
	}

	function clickImport() {
		showImportModal = true;
	}
</script>

<style>
	.accounts {
		background: var(--background-image) 0 0 / 400px repeat;
	}

	.accounts .accounts-wrapper {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		height: 100dvh;
	}

	:global(.button) {
		white-space: nowrap;
	}
</style>

{#snippet accountTable(account)}
	<Table>
		<Thead>
			<TheadTr>
				<Th>Server</Th>
				<Th>Address</Th>
				<Th>Enabled</Th>
				<Th>Action</Th>
			</TheadTr>
		</Thead>
		<Tbody>
			<TbodyTr>
				<Td title="Server" data-testid="account-server@{account.credentials.address}@{account.credentials.server}">{account.credentials.server}</Td>
				<Td title="Address" data-testid="account-address@{account.credentials.address}@{account.credentials.server}">{account.credentials.address}</Td>
				<Td title="Enabled" data-testid="account-enabled@{account.credentials.address}@{account.credentials.server}">{account.enabled ? 'Yes' : 'No'}</Td>
				<Td title="Action">
					<TableActionItems>
						<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickEdit(account.id)} data-testid="edit-account-button" />
						<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickDel(account.id)} data-testid="delete-account-button" />
					</TableActionItems>
				</Td>
			</TbodyTr>
		</Tbody>
	</Table>
{/snippet}

{#snippet status(account)}
	<div class="optional-data">
		<AccountStatusIconIconAndText account={findAccount(account.id)} />
	</div>
{/snippet}

<div class="accounts">
	<Bar>
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Account management" />
		{/snippet}
		{#snippet right()}
			<Icon img="img/cross.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<div class="accounts-wrapper">
		<Paper>
			<ButtonBar>
				<Button img="img/accounts-add.svg" colorVariable="--primary-foreground" text="Add a new account" onClick={addAccountModal} data-testid="add-account-button" />
				<Button img="img/import.svg" colorVariable="--primary-foreground" text="Import" onClick={clickImport} data-testid="accounts-import-button" />
				<Button img="img/export.svg" colorVariable="--primary-foreground" text="Export" onClick={clickExport} data-testid="accounts-export-button" />
			</ButtonBar>
			<Accordion items={$accounts_config.map(a => ({ ...a, name: a.settings?.title }))} content={accountTable} header={status} expandAllOnDesktop={true} mode="multiple" />
		</Paper>
	</div>
</div>

{#key modalKey}
	<Modal title={idItem === null ? 'Add a new account' : 'Edit account'} body={ModalAccountsAddEdit} params={{ id: idItem || null }} bind:show={showAddEditAccountModal} width="fit-content" />
{/key}
<Modal title="Export all accounts" body={ModalAccountsExport} bind:show={showExportModal} width="700px" />
<Modal title="Import accounts" body={ModalAccountsImport} bind:show={showImportModal} width="700px" testId="accounts-import" />
<Modal title="Delete the account" body={ModalAccountsDelete} params={{ id: idItem }} bind:show={showDelAccountModal} />
