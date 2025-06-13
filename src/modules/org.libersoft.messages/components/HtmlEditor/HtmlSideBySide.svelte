<script>
	import HtmlEditor from './HtmlEditor.svelte';
	import HtmlEditorPreview from './HtmlEditorPreview.svelte';
	export let text;
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
		width: calc(50% - 10px);
	}
</style>

<div class="sides" data-testid="html-editor-side-by-side">
	<div class="editor" data-testid="html-editor-side-editor">
		<HtmlEditor bind:text />
		<!-- <textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea> -->
	</div>
	<div class="preview" data-testid="html-editor-side-preview">
		<HtmlEditorPreview {text} />
	</div>
</div>
