<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	interface Props {
		params: { id: string | null };
	}
	let { params }: Props = $props();
	let elModal: Modal;
	let snippet_top: Snippet | undefined = $state(undefined);
	let snippet_bottom: Snippet | undefined = $state(undefined);

	export function open() {
		elModal?.open();
	}

	export function close() {
		elModal?.close();
	}
</script>

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} {params} {close} />
<Modal title={params.id === null ? 'Add a new account' : 'Edit account'} bind:this={elModal} top={snippet_top} bottom={snippet_bottom} />
