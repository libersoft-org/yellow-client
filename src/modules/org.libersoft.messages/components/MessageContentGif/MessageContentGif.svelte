<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import { getContext } from 'svelte';
	let { node } = $props();
	let v = node.attributes.file?.value;
	let messages_context: any = getContext('MessagesContext');

	async function openExpressions() {
		await messages_context.messageBar?.openExpressions('gifs');
	}
</script>

<style>
	.gif {
		display: flex;
		border-radius: 10px;
		overflow: hidden;
	}
</style>

{#if v}
	<div class="gif">
		<Clickable onClick={openExpressions}>
			<img src={v} alt="GIF" />
		</Clickable>
	</div>
{:else}
	error
{/if}
