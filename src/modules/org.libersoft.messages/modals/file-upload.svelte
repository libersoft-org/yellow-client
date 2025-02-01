<script>
 import Button from '../../../core/components/button.svelte';
 import { humanSize } from '../../../core/utils/file.utils.js';
 import { truncateText } from '../../../core/utils/text.utils.js';
 import { FileUploadRecordType } from '../fileUpload/types.ts';
 import { get } from 'svelte/store';
 import { identifier, selectedConversation, initUpload } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
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

 .header {
  display: flex;
  gap: 10px;
  justify-content: space-between;
 }

 .body .items {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
 }

 .body .items .item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
 }

 .body .items .item .desc {
  flex: 1 1 100%;
  display: flex;
  justify-content: space-between;
  gap: 8px;
 }

 .body .items-empty {
  padding-top: 30px;
  padding-bottom: 40px;
  text-align: center;
  background-color: #eee;
  border: 1px dashed #888;
  border-radius: 10px;
 }

 .footer {
  display: flex;
  gap: 8px;
  justify-content: end;
 }
</style>

{#snippet fileUploadItem(file)}
 <div class="item">
  <div class="desc">
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
 <div class="header">
  <Button width="110px" img="img/add-black.svg" text="Add files" onClick={onFileAdd} />
  <Button width="110px" img="img/del.svg" text="Remove all" onClick={onDeleteAll} />
 </div>
 <div class="body">
  {#if files.length}
   <div class="items">
    {#each files as file}
     {@render fileUploadItem(file)}
    {/each}
   </div>
  {:else}
   <BaseButton onClick={onFileAdd}>
    <div class="items-empty">
     Drag and drop your files here<br />or click here to add files.
    </div>
   </BaseButton>
  {/if}
 </div>
 <div class="footer">
  <Button width="180px" img="modules/{identifier}/img/upload.svg" text="Send peer-to-peer" onClick={uploadP2P} enabled={files.length} />
  <Button width="180px" img="modules/{identifier}/img/upload.svg" text="Send to server" onClick={uploadServer} enabled={files.length} />
 </div>
</div>
