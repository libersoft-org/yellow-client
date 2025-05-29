<script>
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import { getContext } from 'svelte';

	let { node } = $props();
	let v = node.attributes.file?.value;

	let messages_context = getContext('MessagesContext');

	async function openExpressions() {
		await messages_context.messageBar?.openExpressions('gifs');
	}
</script>

{#if v}
	<div class="gif">
		<BaseButton onClick={openExpressions}>
			<img src={v} alt="GIF" />
		</BaseButton>
	</div>
{:else}
	error
{/if}

<style>
	.gif {
		display: flex;
		border-radius: 10px;
		overflow: hidden;
	}
</style>
