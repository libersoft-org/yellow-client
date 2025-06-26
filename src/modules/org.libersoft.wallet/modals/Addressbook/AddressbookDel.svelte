<script lang="ts">
	import { addressBook } from '../../wallet.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
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

<div class="text">Would you like to delete the item "<span class="bold">{params.item.alias}</span>" from address book?</div>
{#if error}
	<Alert type="error" message={error} />
{/if}
<ButtonBar expand>
	<Button img="img/check.svg" text="Yes" onClick={clickDelete} />
	<Button img="img/cross.svg" text="No" onClick={close} />
</ButtonBar>
