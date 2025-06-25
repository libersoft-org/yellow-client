<script lang="ts">
	import { derived, get } from 'svelte/store';
	import { accounts } from '@/core/accounts.ts';
	import { delAccount } from '@/core/accounts_config.js';
	import Dialog from '../components/Dialog/Dialog.svelte';
	interface Props {
		id: string;
	}
	let { id }: Props = $props();
	let elDialog: Dialog;
	let question = '';
	let account = derived([accounts], ([$accounts]) => {
		question += 'Would you like to delete the account ';
		if ($account?.settings?.title) {
			question += '"';
			question += '<span class="bold">' + $account?.settings?.title + '</span>';
			question += '" (';
			question += '<span class="bold">' + $account?.credentials?.address + '</span>';
			question += '<span>)</span>';
		} else question += '<span class="bold">' + $account?.credentials?.address + '</span>';
		question += '?';
		console.log('[INIT] Modal mounted. id:', id);
		const found = $accounts.find(acc => get(acc).id === id);
		console.log('[DERIVED] account store for delete modal:', id, '→ found account:', found ? get(found) : null);
		return found ? get(found) : null;
	});
	let dialogData = {
		title: 'Delete the account',
		body: question,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

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

<Dialog data={dialogData} bind:this={elDialog} />
