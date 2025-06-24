<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	interface Props {
		params: { id: string | null };
	}
	let { params }: Props = $props();
	let elModal;
	let snippet_top: Snippet = $state(null);
	let snippet_bottom: Snippet = $state(null);

	export function open() {
		if (elModal) elModal.open();
	}

	export function close() {
		if (elModal) elModal.close();
	}
</script>

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} {params} {show} close={() => (show = false)} />
<Modal title={params.id === null ? 'Add a new account' : 'Edit account'} bind:this={elModal} top={snippet_top} bottom={snippet_bottom} />
