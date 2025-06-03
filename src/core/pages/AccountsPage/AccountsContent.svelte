<script lang="ts">
	import { findAccount, selected_corepage_id, accounts_config, hideSidebarMobile, isMobile } from '@/core/core.js';
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
	import AccountsExport from '@/core/modals/Accounts/AccountsExport.svelte';
	import AccountsImport from '@/core/modals/Accounts/AccountsImport.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';

	interface Props {
		showAddEditAccountModal: boolean;
		showDelAccountModal: boolean;
		showExportModal: boolean;
		showImportModal: boolean;
		idItem: string | null;
		accountTitle: string;
	}

	let { showAddEditAccountModal = $bindable(false), showDelAccountModal = false, showExportModal = $bindable(false), showImportModal = $bindable(false), idItem = $bindable(null), accountTitle = $bindable('') }: Props = $props();

	function back() {
		hideSidebarMobile.set(false);
		selected_corepage_id.set(null);
	}

	function addAccountModal() {
		idItem = null;
		showAddEditAccountModal = true;
	}

	function clickEdit(id: string) {
		idItem = id;
		showAddEditAccountModal = true;
	}

	const clickDel = (id: string, title: string) => {
		idItem = id;
		accountTitle = title;
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

		.accounts-wrapper {
			display: flex;
			flex-direction: column;
			gap: 10px;
			padding: 10px;
			height: 100dvh;
		}
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
				<Td title="Server">{account.credentials.server}</Td>
				<Td title="Address">{account.credentials.address}</Td>
				<Td title="Enabled">{account.enabled ? 'Yes' : 'No'}</Td>
				<Td title="Action">
					<TableActionItems>
						<Icon img="img/edit.svg" alt="Edit" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickEdit(account.id)} />
						<Icon img="img/del.svg" alt="Delete" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => clickDel(account.id, account.settings?.title)} />
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
	<TopBar>
		<svelte:fragment slot="left">
			{#if $isMobile}
				<Icon img="img/back.svg" onClick={back} colorVariable="--primary-foreground" visibleOnDesktop={false} />
			{/if}
			<h1 class="title">Account management</h1>
		</svelte:fragment>
	</TopBar>
	<div class="accounts-wrapper">
		<Paper>
			<ButtonBar>
				<Button img="img/accounts.svg" colorVariable="--primary-foreground" text="Add a new account" onClick={addAccountModal} />
				<Button img="img/export.svg" colorVariable="--primary-foreground" text="Export" onClick={clickExport} />
				<Button img="img/import.svg" colorVariable="--primary-foreground" text="Import" onClick={clickImport} />
			</ButtonBar>
			<Accordion items={$accounts_config.map(a => ({ ...a, name: a.settings?.title }))} activeIndex={null} content={accountTable} header={status} expandAllOnDesktop={true} mode="multiple" />
		</Paper>
	</div>
</div>

<Modal title={idItem === null ? 'Add a new account' : 'Edit account'} body={ModalAccountsAddEdit} params={{ id: idItem || null }} bind:show={showAddEditAccountModal} width="fit-content" />
<Modal title="Export all accounts" body={AccountsExport} bind:show={showExportModal} width="700px" />
<Modal title="Import accounts" body={AccountsImport} bind:show={showImportModal} width="700px" />
<Modal title="Delete the account" body={ModalAccountsDelete} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
