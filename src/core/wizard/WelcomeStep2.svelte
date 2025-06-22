<script lang="ts">
	import type { Snippet } from 'svelte';
	//import ModalAccountsAddEdit from '@/core/modals/Accounts/AccountsAddEdit.svelte';
	import FormAddEdit from '@/core/forms/Accounts/AccountsAddEdit.svelte';
	export let params;
	let snippet_top: Snippet;
	let snippet_bottom: Snippet;

	function close() {
		console.log('close');
	}

	function save_id(id) {
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

<FormAddEdit bind:top={snippet_top} bind:bottom={snippet_bottom} isInWelcomeWizard {close} {save_id} params={{ id: params?.account_id ?? null }} show={true} />
{#if snippet_top && snippet_bottom}
	<div class="form">
		<div>{@render snippet_top()}</div>
		<div>{@render snippet_bottom()}</div>
	</div>
{/if}
<!--
	<ModalAccountsAddEdit isInWelcomeWizard {close} {save_id} params={{ id: params?.account_id ?? null }} />
-->
