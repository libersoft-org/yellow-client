<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { accounts } from '@/core/accounts.ts';
	import { delAccount } from '@/core/accounts_config.js';
	import Dialog from '../components/Dialog/Dialog.svelte';
	interface Props {
		id: string;
	}
	let { id }: Props = $props();
	let elDialog: Dialog;
	let accountIdentifier = $state();

	onMount(() => {
		accountIdentifier = account?.credentials?.address || account?.id || 'unknown';
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

	let dialogData = $derived.by(() => {
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
		<span>Would you like to delete the account </span>
		<span>"</span>
		<span class="bold">{account.settings.title}</span>
		<span>" (</span>
		<span class="bold">{accountIdentifier}</span>
		<span>)</span>
	{:else}
		<span class="bold">{accountIdentifier}</span>
	{/if}
	<span>?</span>
{/snippet}

<Dialog data={dialogData} bind:this={elDialog} />
