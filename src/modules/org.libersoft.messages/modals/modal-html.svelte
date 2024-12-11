<script>
 import Button from '../../../core/components/button.svelte';
 let text = '';
</script>

<style>
 .html {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 800px;
  height: 480px;
 }

 .sides {
  display: flex;
  width: 100%;
  height: 100%;
 }

 .sides .editor {
  border: 1px solid #000;
  width: 50%;
 }

 .sides .editor .text {
  width: calc(100% - 10px);
  height: calc(100% - 10px);
 }

 .sides .preview {
  border: 1px solid #000;
  width: 50%;
 }
</style>

<div class="html">
 <div class="sides">
  <div class="editor">
   <textarea class="text" bind:value={text} rows="5" cols="30"></textarea>
  </div>
  <div class="preview">
   {@html text}
  </div>
 </div>
 <Button text="Send" />
</div>
