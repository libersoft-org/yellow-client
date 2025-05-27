<script lang="ts">
 import { FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
 import { humanSize } from '@/core/utils/fileUtils.js';
 import { truncateText } from '@/core/utils/textUtils.js';
 import { get, type Writable } from 'svelte/store';
 import { getContext } from 'svelte';
 import { identifier, selectedConversation, initUpload } from '../messages.js';

 import Button from '@/core/components/Button/Button.svelte';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import Table from '@/core/components/ResponsiveTable/Table.svelte';
 import THead from '@/core/components/ResponsiveTable/THead.svelte';
 import THeadTr from '@/core/components/ResponsiveTable/THeadTr.svelte';
 import THeadTh from '@/core/components/ResponsiveTable/THeadTh.svelte';
 import TBody from '@/core/components/ResponsiveTable/TBody.svelte';
 import TBodyTr from '@/core/components/ResponsiveTable/TBodyTr.svelte';
 import TBodyTd from '@/core/components/ResponsiveTable/TBodyTd.svelte';

 type FileUploadModalContext = {
  fileUploadModalFiles: Writable<File[]>;
 };

 const { params } = $props();

 let elFileInput;
 let dropActive = $state(false);
 let { fileUploadModalFiles } = getContext<FileUploadModalContext>('FileUploadModal');

 function onFileAdd(e) {
  e && e.preventDefault();
  elFileInput.click();
 }

 function onDeleteAll() {
  $fileUploadModalFiles = [];
 }

 function onFileDelete(file) {
  const index = $fileUploadModalFiles.indexOf(file);
  if (index > -1) {
   $fileUploadModalFiles.splice(index, 1);
  }
 }

 function onFileUpload(e) {
  $fileUploadModalFiles = [...$fileUploadModalFiles, ...e.target.files];
  elFileInput.value = '';
 }

 const uploadServer = () => {
  const recipientEmail = get(selectedConversation).address;
  initUpload($fileUploadModalFiles, FileUploadRecordType.SERVER, [recipientEmail]);
  params.setFileUploadModal(0);
 };

 const uploadP2P = () => {
  const recipientEmail = get(selectedConversation).address;
  initUpload($fileUploadModalFiles, FileUploadRecordType.P2P, [recipientEmail]);
  params.setFileUploadModal(0);
 };

 function onDragOver(e) {
  e.preventDefault();
  dropActive = true;
 }

 function onDragLeave(e) {
  e.preventDefault();
  dropActive = false;
 }

 function onDrop(e) {
  e.preventDefault();
  dropActive = false;
  $fileUploadModalFiles = [...e.dataTransfer.files, ...$fileUploadModalFiles];
 }
</script>

<style>
 .file-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .header {
  display: flex;
  gap: 10px;
  justify-content: space-between;
 }

 .body .items-empty {
  padding: 50px;
  text-align: center;
  background-color: #eee;
  border: 1px dashed #888;
  border-radius: 10px;
 }

 .drop-active .items-empty {
  background-color: #ddd;
  border-color: #555;
 }

 .drop-active .file-table {
  filter: brightness(0.7);
 }

 .footer {
  display: flex;
  gap: 10px;
  justify-content: space-between;
 }
</style>

{#snippet fileUploadItem(file)}
 <TBodyTr>
  <TBodyTd title="File name">
   {truncateText(file.name, 30)}
  </TBodyTd>
  <TBodyTd title="Size">
   {humanSize(file.size)}
  </TBodyTd>
  <TBodyTd title="Action">
   <Icon img="img/del.svg" colorVariable="--icon-red" alt="Delete" size="20px" padding="5px" onClick={() => onFileDelete(file)} />
  </TBodyTd>
 </TBodyTr>
{/snippet}

<div class="file-upload {dropActive ? 'drop-active' : ''}">
 <input type="file" id="fileInput" bind:this={elFileInput} onchange={onFileUpload} multiple style="display: none;" data-testid="file-upload-input" />
 <div class="header">
  <Button width="110px" img="img/add.svg" colorVariable="--icon-black" text="Add files" onClick={onFileAdd} />
  <Button width="110px" img="img/del.svg" colorVariable="--icon-black" text="Remove all" enabled={$fileUploadModalFiles.length > 0} onClick={onDeleteAll} />
 </div>
 <div class="body" ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop} role="region" aria-label="File drop zone">
  {#if $fileUploadModalFiles.length}
   <div class="items file-table">
    <Table>
     <THead>
      <THeadTr>
       <THeadTh>File name:</THeadTh>
       <THeadTh>Size:</THeadTh>
       <THeadTh>Action:</THeadTh>
      </THeadTr>
     </THead>
     <TBody>
      {#each $fileUploadModalFiles as file}
       {@render fileUploadItem(file)}
      {/each}
     </TBody>
    </Table>
   </div>
  {:else}
   <BaseButton onClick={onFileAdd}>
    <div class="items-empty" role="none">
     Drag and drop your files here<br />or click here to add files.
    </div>
   </BaseButton>
  {/if}
 </div>
 <div class="footer">
  <Button width="180px" img="img/upload.svg" text="Send peer-to-peer" onClick={uploadP2P} enabled={$fileUploadModalFiles.length > 0} data-testid="send-files-p2p" />
  <Button width="180px" img="img/upload.svg" text="Send to server" onClick={uploadServer} enabled={$fileUploadModalFiles.length > 0} data-testid="send-files-server" />
 </div>
</div>
