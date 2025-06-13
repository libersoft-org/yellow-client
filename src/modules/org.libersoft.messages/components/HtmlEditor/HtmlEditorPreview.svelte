<script>
	import MessageContent from '../MessageContent/MessageContent.svelte';
	import { processMessage } from '../../messages.js';
	export let text;

	$: messageContent = processMessage({ format: 'html', message: text });
</script>

<style>
	.preview {
		padding: 10px;
		width: calc(100% - 22px);
		height: calc(100% - 22px);
		background-color: var(--default-background);
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
	}
</style>

<div class="preview" data-testid="html-editor-preview">
	<MessageContent {messageContent} />
</div>
