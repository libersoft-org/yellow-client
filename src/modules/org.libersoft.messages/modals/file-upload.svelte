<script>
 import Button from '../../../core/components/button.svelte';
 import { humanSize } from '../../../core/utils/file.utils.js';
 import { truncateText } from '../../../core/utils/text.utils.js';
 import { FileUploadRecordType } from '../fileUpload/types.ts';
 import { get } from 'svelte/store';
 import { selectedConversation, initUpload } from '../messages.js';

 const { params } = $props();

 // refs
 let elFileInput;

 // store
 let files = $state([]);

 function onFileAdd(e) {
  e && e.preventDefault();
  elFileInput.click();
 }

 function onDeleteAll() {
  files = [];
 }

 function onFileDelete(file) {
  const index = files.indexOf(file);
  if (index > -1) {
   files.splice(index, 1);
  }
 }

 function onFileUpload(e) {
  let filesToPush = e.target.files;
  for (let i = 0; i < filesToPush.length; i++) {
   files.push(filesToPush[i]);
  }

  // clear the file input
  elFileInput.value = '';
 }

 const uploadServer = () => {
  const recipientEmail = get(selectedConversation).address;
  initUpload(files, FileUploadRecordType.SERVER, [recipientEmail]);
  params.setFileUploadModal(false);
 };

 const uploadP2P = () => {
  const recipientEmail = get(selectedConversation).address;
  initUpload(files, FileUploadRecordType.P2P, [recipientEmail]);
  params.setFileUploadModal(false);
 };
</script>

<style>
 .file-upload {
  min-width: 400px;
 }

 .file-upload-header {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 8px;
 }

 .file-upload-footer {
  display: flex;
  gap: 8px;
  justify-content: end;
 }

 .file-upload-items {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
 }

 .file-upload-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
 }

 .file-upload-item-desc {
  flex: 1 1 100%;
  display: flex;
  justify-content: space-between;
  gap: 8px;
 }

 .file-upload-items-empty {
  padding-top: 30px;
  padding-bottom: 40px;
  text-align: center;
 }
</style>

{#snippet fileUploadItem(file)}
 <div class="file-upload-item">
  <div class="file-upload-item-desc">
   <div>{truncateText(file.name, 30)}</div>
   <div>{humanSize(file.size)}</div>
  </div>
  <div>
   <Button img="img/close-black.svg" onClick={() => onFileDelete(file)} />
  </div>
 </div>
{/snippet}

<div class="file-upload">
 <input type="file" id="fileInput" bind:this={elFileInput} onchange={onFileUpload} multiple style="display: none;" />
 <div class="file-upload-header">
  <Button width="80px" text="Add files" onClick={onFileAdd} />
  <Button width="80px" text="Delete all" onClick={onDeleteAll} />
 </div>
 <div class="file-upload-body">
  {#if files.length}
   <div class="file-upload-items">
    {#each files as file}
     {@render fileUploadItem(file)}
    {/each}
   </div>
  {:else}
   <div class="file-upload-items-empty">
    No files here. <br /> You can <a href="#" onclick={onFileAdd}>add some</a>.
   </div>
  {/if}
 </div>
 <div class="file-upload-footer">
  <Button width="80px" text="Send P2P" onClick={uploadP2P} enabled={files.length} />
  <Button width="80px" text="Upload" onClick={uploadServer} enabled={files.length} />
 </div>
</div>
