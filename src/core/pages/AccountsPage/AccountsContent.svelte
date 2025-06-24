<script lang="ts">
	import { findAccount, accounts_config, setCorePage } from '@/core/core.ts';
	import { hideSidebarMobile } from '@/core/stores.ts';
	import Content from '@/core/components/Content/Content.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
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
	import ModalAccountsAddEdit from '@/core/modals/Accounts/AccountsAddEdit.svelte';
	import ModalAccountsDelete from '@/core/modals/Accounts/AccountsDelete.svelte';
	import ModalAccountsImport from '@/core/modals/Accounts/AccountsImport.svelte';
	import ModalAccountsExport from '@/core/modals/Accounts/AccountsExport.svelte';
	import Accordion from '@/core/components/Accordion/Accordion.svelte';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';
	let idItem: string | null = $state(null);
	let modalKey: number = $state(0);
	let elModalAccountsAddEdit;
	let elModalAccountsDelete;
	let elModalAccountsImport;
	let elModalAccountsExport;

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
		elModalAccountsAddEdit.open();
	}

	function clickEdit(id: string) {
		idItem = id;
		elModalAccountsAddEdit.open();
	}

	const clickDel = (id: string) => {
		idItem = id;
		elModalAccountsDelete.open();
	};

	function clickImport() {
		elModalAccountsImport.open();
	}

	function clickExport() {
		elModalAccountsExport.open();
	}
</script>

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

<Content>
	<Bar>
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Account management" />
		{/snippet}
		{#snippet right()}
			<Icon img="img/cross.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<Page hAlign="center">
		<Paper>
			<ButtonBar>
				<Button img="img/accounts-add.svg" text="Add a new account" onClick={addAccountModal} data-testid="add-account-button" />
				<Button img="img/import.svg" text="Import" onClick={clickImport} data-testid="accounts-import-button" />
				<Button img="img/export.svg" text="Export" onClick={clickExport} data-testid="accounts-export-button" />
			</ButtonBar>
			<Accordion items={$accounts_config.map(a => ({ ...a, name: a.settings?.title }))} content={accountTable} header={status} expandAllOnDesktop mode="multiple" />
		</Paper>
	</Page>
</Content>
{#key modalKey}
	<ModalAccountsAddEdit params={{ id: idItem || null }} bind:this={elModalAccountsAddEdit} />
{/key}
<ModalAccountsDelete params={{ id: idItem }} bind:this={elModalAccountsDelete} />
<ModalAccountsImport bind:this={elModalAccountsImport} />
<ModalAccountsExport bind:this={elModalAccountsExport} />
