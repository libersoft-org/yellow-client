<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	interface Props {
		params: any;
	}
	let { params }: Props = $props();
	let snippet_top: Snippet | undefined = $state(undefined);
	let snippet_bottom: Snippet | undefined = $state(undefined);

	function close(): void {
		console.log('close');
	}

	function save_id(id: any): void {
		console.log('save_id: ', id);
		params.account_id = id;
	}
</script>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} isInWelcomeWizard {close} {save_id} params={{ id: params?.account_id ?? null }} />
{#if snippet_top && snippet_bottom}
	<div class="form">
		<div>{@render snippet_top()}</div>
		<div>{@render snippet_bottom()}</div>
	</div>
{/if}
