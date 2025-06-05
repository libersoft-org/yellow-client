<script lang="ts">
	import { derived, get } from 'svelte/store';
	import Button from '@/core/components/Button/Button.svelte';
	import { delAccount } from '@/core/accounts_config.js';
	import { accounts } from '@/core/accounts.ts';

	interface Props {
		close: () => void;
		params: {
			id: string;
			name: string;
		};
	}
	let { close, params = $bindable() }: Props = $props();
	let account = derived([accounts], ([$accounts]) => {
		console.log('[INIT] Modal mounted. Params:', params);
		const found = $accounts.find(acc => get(acc).id === params.id);
		console.log('[DERIVED] account store for delete modal:', params.id, '→ found account:', found ? get(found) : null);
		return found ? get(found) : null;
	});

	function clickDel() {
		console.log('clickDel');
		delAccount(params.id);
		close();
	}
</script>

<style>
	.accounts-delete {
		width: fit-content;
	}
</style>

<div class="accounts-delete">
	Would you like to delete the account {#if $account?.settings?.title}"<span class="bold">{$account?.settings?.title}</span>" ({/if}<span class="bold">{$account?.credentials?.address} at {$account?.credentials?.server}</span>{#if $account?.settings?.title}){/if}?
</div>
<Button text="Delete" onClick={clickDel} />
