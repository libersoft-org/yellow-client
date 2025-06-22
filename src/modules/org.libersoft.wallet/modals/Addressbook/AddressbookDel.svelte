<script lang="ts">
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import { addressBook } from '../../wallet.ts';
	interface Props {
		close: () => void;
		params: {
			item: {
				guid: string;
				alias: string;
			};
		};
	}
	let { close, params }: Props = $props();
	let error: string | undefined;

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

<div class="text">Would you like to delete the item "{params.item.alias}"?</div>
{#if error}
	<Alert type="error" message={error} />
{/if}
<Button img="img/del.svg" text="Delete" onClick={clickDelete} />
