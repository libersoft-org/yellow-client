<script lang="ts">
	import { get } from 'svelte/store';
	import { accounts } from '@/core/accounts.ts';
	import { delAccount } from '@/core/accounts_config.js';
	import Dialog from '../components/Dialog/Dialog.svelte';
	interface Props {
		id: string;
	}
	let { id }: Props = $props();
	let elDialog: Dialog;
	let accountIdentifier: string | undefined = $state();

	$effect(() => {
		accountIdentifier = account?.credentials?.address || account?.id;
	});

	let account = $derived.by(() => {
		const accountStore = $accounts.find(acc => get(acc).id === id);
		if (!accountStore) {
			console.warn('[AccountsDelete] No account found with id:', id);
			return null;
		}
		let account = get(accountStore);
		return account;
	});

	let dialogData: Dialog.IDialogData = $derived.by(() => {
		return {
			title: 'Delete the account',
			body: question,
			icon: 'img/del.svg',
			buttons: [
				{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, testId: 'delete-account-confirm' },
				{ img: 'img/cross.svg', text: 'No', onClick: clickNo, testId: 'delete-account-cancel' },
			],
		};
	});

	export function open() {
		elDialog?.open();
	}

	export function close() {
		elDialog?.close();
	}

	function clickYes() {
		delAccount(id);
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

{#snippet question()}
	{#if account?.settings?.title}
		<div>Would you like to delete the account "<span class="bold">{account.settings.title}</span>" (<span class="bold">{accountIdentifier}</span>)?</div>
	{:else}
		<div>Would you like to delete the account "<span class="bold">{accountIdentifier}</span>"?</div>
	{/if}
{/snippet}

<Dialog data={dialogData} bind:this={elDialog} />
