<script>
 import Button from '../../../core/components/button.svelte';
 import { humanSize } from '../../../core/utils/file.utils.js';
 import { truncateText } from '../../../core/utils/text.utils.js';
 import { FileUploadRecordType } from '../fileUpload/types.ts';
 import { get } from 'svelte/store';
 import { identifier, selectedConversation, initUpload } from '../messages.js';

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
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 400px;
 }

 .file-upload-header {
  display: flex;
  gap: 10px;
  justify-content: space-between;
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
  background-color: #eee;
  border: 1px dashed #888;
  border-radius: 10px;
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
  <Button width="110px" img="img/add-black.svg" text="Add files" onClick={onFileAdd} />
  <Button width="110px" img="img/del.svg" text="Remove all" onClick={onDeleteAll} />
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
    Drag and drop your files here<br />or click on <span class="bold">Add files</span> button.
   </div>
  {/if}
 </div>
 <div class="file-upload-footer">
  <Button width="180px" img="modules/{identifier}/img/upload.svg" text="Send peer-to-peer" onClick={uploadP2P} enabled={files.length} />
  <Button width="180px" img="modules/{identifier}/img/upload.svg" text="Send to server" onClick={uploadServer} enabled={files.length} />
 </div>
</div>
