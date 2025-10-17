<script lang="ts">
	import HtmlEditor from './HtmlEditor.svelte';
	import HtmlEditorPreview from './HtmlEditorPreview.svelte';
	interface Props {
		text?: string;
	}
	let { text = $bindable() }: Props = $props();
</script>

<style>
	.sides {
		display: flex;
		gap: 10px;
		width: 100%;
		height: 100%;
	}

	.sides .editor,
	.sides .preview {
		box-sizing: border-box;
		width: 50%;
	}
</style>

<div class="sides">
	<div class="editor">
		<HtmlEditor bind:text />
		<!-- <textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea> -->
	</div>
	<div class="preview">
		<HtmlEditorPreview {text} />
	</div>
</div>
