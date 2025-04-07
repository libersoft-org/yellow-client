<script>
 import HtmlEditor from './HtmlEditor.svelte';
 import HtmlEditorPreview from './HtmlEditorPreview.svelte';
 export let text;
</script>

<style>
 .sides {
  display: flex;
  width: 100%;
  height: 100%;
 }
 .sides .editor {
  border: 1px solid #000;
  width: 50%;
 }

 .sides .preview {
  border: 1px solid #000;
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
