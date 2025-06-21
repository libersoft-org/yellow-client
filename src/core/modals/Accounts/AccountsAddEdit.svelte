<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	interface Props {
		params: { id: string | null };
		show?: boolean;
	}
	let { params, show = $bindable(false) }: Props = $props();
	let snippet_top: Snippet = $state(null);
	let snippet_bottom: Snippet = $state(null);
</script>

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} {params} {show} close={() => (show = false)} />
<Modal title={params.id === null ? 'Add a new account' : 'Edit account'} bind:show top={snippet_top} bottom={snippet_bottom} />
