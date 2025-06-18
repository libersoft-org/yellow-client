<script lang="ts">
	import { derived, get } from 'svelte/store';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { delAccount } from '@/core/accounts_config.js';
	import { accounts } from '@/core/accounts.ts';
	interface Props {
		close: () => void;
		show?: boolean;
		params: {
			id: string;
			name: string;
		};
	}
	let { close, params = $bindable(), show = $bindable() }: Props = $props();

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

<div class="accounts-delete">
	<span>Would you like to delete the account </span>
	{#if $account?.settings?.title}
		<span>"</span>
		<span class="bold">{$account?.settings?.title}</span>
		<span>" (</span>
		<span class="bold">{$account?.credentials?.address}</span>
		<span>)</span>
	{:else}
		<span class="bold">{$account?.credentials?.address}</span>
	{/if}
	<span>?</span>
</div>
<ButtonBar>
	<Button text="Delete" img="img/del.svg" onClick={clickDel} />
	<Button text="Cancel" img="img/close.svg" onClick={() => (show = false)} />
</ButtonBar>
