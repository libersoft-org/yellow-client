<script>
 import Editor from '../components/html-editor.svelte';
 import Preview from '../components/html-editor-preview.svelte';
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
  <Editor bind:text />
  <!-- <textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea> -->
 </div>
 <div class="preview">
  <Preview {text} />
 </div>
</div>
