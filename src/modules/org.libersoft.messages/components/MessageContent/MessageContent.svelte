<script lang="ts">
	import MessageContentRenderer from './MessageContentRenderer.svelte';
	import { onMount } from 'svelte';
	interface Props {
		messageContent?: any;
	}
	let { messageContent }: Props = $props();

	onMount(() => {
		//console.log('messageContent:', messageContent);
	});
</script>

<style>
	.text {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding-bottom: 10px;
		word-break: break-word;
		overflow-wrap: break-word;
	}
</style>

<div class="text">
	<MessageContentRenderer rootNode={messageContent.body} />
</div>
