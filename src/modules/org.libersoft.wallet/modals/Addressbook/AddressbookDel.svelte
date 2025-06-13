<script>
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import { addressBook } from '../../wallet.ts';
	export let close;
	export let params;
	let error;

	function clickDelete() {
		addressBook.set($addressBook.filter(i => i.guid !== params.item.guid));
		close();
	}
</script>

<style>
	.text {
		text-align: left;
	}
</style>

<div class="text" data-testid="addressbook-delete-confirmation">Would you like to delete the item "{params.item.alias}"?</div>
{#if error}
	<Alert type="error" message={error} data-testid="addressbook-delete-error" />
{/if}
<Button text="Delete" onClick={clickDelete} data-testid="addressbook-delete-btn" />
