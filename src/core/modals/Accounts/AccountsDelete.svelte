<script lang="ts">
	import { derived, get } from 'svelte/store';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { delAccount } from '@/core/accounts_config.js';
	import { accounts } from '@/core/accounts.ts';
	interface Props {
		show?: boolean;
		close: () => void;
		params: {
			id: string;
			name: string;
		};
	}
	let { show = $bindable(false), close, params = $bindable() }: Props = $props();
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

<Modal title="Delete the account" bind:show>
	{#snippet top()}
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
	{/snippet}
	{#snippet bottom()}
		<ButtonBar expand>
			<Button img="img/del.svg" text="Delete" onClick={clickDel} />
			<Button img="img/cancel.svg" text="Cancel" onClick={() => (show = false)} />
		</ButtonBar>
	{/snippet}
</Modal>
