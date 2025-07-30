<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	interface Props {
		params: { id: string | null };
	}
	let { params }: Props = $props();
	let elWindow: Window;
	let snippet_top: Snippet | undefined = $state(undefined);
	let snippet_bottom: Snippet | undefined = $state(undefined);

	export function open() {
		elWindow?.open();
	}

	export function close() {
		elWindow?.close();
	}
</script>

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} {params} {close} />
<Window title={params.id === null ? 'Add a new account' : 'Edit account'} bind:this={elWindow} top={snippet_top} bottom={snippet_bottom} />
