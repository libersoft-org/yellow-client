<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	interface Props {
		params: { id: string | null };
		show?: boolean;
	}
	let { params, show = $bindable(false) }: Props = $props();
	let snippet_top: Snippet;
	let snippet_bottom: Snippet;
</script>

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} {params} {show} close={() => (show = false)} />
<Modal title={params.id === null ? 'Add a new account' : 'Edit account'} bind:show bind:top={snippet_top} bind:bottom={snippet_bottom} />
