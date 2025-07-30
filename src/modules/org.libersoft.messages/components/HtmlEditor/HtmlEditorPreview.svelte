<script>
	import MessageContent from '@/org.libersoft.messages/components/MessageContent/MessageContent.svelte';
	import { processMessage } from '@/org.libersoft.messages/scripts/messages.js';
	export let text;

	$: messageContent = processMessage({ format: 'html', message: text });
</script>

<style>
	.preview {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 10px;
		background-color: var(--default-background);
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
	}
</style>

<div class="preview">
	<MessageContent {messageContent} />
</div>
