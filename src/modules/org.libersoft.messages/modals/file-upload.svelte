<script>
 import Button from '../../../core/components/button.svelte';
 import { humanSize } from '../../../core/utils/file.utils.js';
 import { truncateText } from '../../../core/utils/text.utils.js';
 import { FileUploadRecordType } from '../fileUpload/types.ts';
 import { get } from 'svelte/store';
 import { identifier, selectedConversation, initUpload } from '../messages.js';
 import BaseButton from '../../../core/components/base-button.svelte';
 import Table from '../../../core/components/table.svelte';
 import Thead from '../../../core/components/table-thead.svelte';
 import TheadTr from '../../../core/components/table-thead-tr.svelte';
 import Th from '../../../core/components/table-thead-th.svelte';
 import Tbody from '../../../core/components/table-tbody.svelte';
 import TbodyTr from '../../../core/components/table-tbody-tr.svelte';
 import Td from '../../../core/components/table-tbody-td.svelte';
 import Icon from '../../../core/components/icon.svelte';
 import { getContext } from 'svelte';
 const { params } = $props();
 let elFileInput; // refs
 let dropActive = $state(false);
 let { fileUploadModalFiles } = getContext('FileUploadModal');

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
  elFileInput.value = ''; // clear the file input
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
  // drop new files on top to be visible when scrolled table body
  $fileUploadModalFiles = [...e.dataTransfer.files, ...$fileUploadModalFiles];
 }
</script>

<style>
 .file-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 500px;
 }

 .header {
  display: flex;
  gap: 10px;
  justify-content: space-between;
 }

 .body .items {
  display: flex;
  flex-direction: column;
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

 .file-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
 }

 .file-table :global(tbody) {
  display: block;
  width: 100%;
  overflow: auto;
  max-height: 35vh;
 }

 .file-table :global(thead tr) {
  display: block;
 }

 .file-table :global(tbody tr),
 .file-table :global(thead tr) {
  display: flex;
  align-items: center;
 }

 .file-table :global(th:nth-child(1)),
 .file-table :global(td:nth-child(1)) {
  flex: 0 1 80%;
 }

 .file-table :global(th:nth-child(2)),
 .file-table :global(td:nth-child(2)) {
  flex: 1 0 20%;
  text-align: right;
 }

 .file-table :global(th:nth-child(3)),
 .file-table :global(td:nth-child(3)) {
  flex: 0 0;
 }
</style>

{#snippet fileUploadItem(file)}
 <TbodyTr>
  <Td>{truncateText(file.name, 30)}</Td>
  <Td>{humanSize(file.size)}</Td>
  <Td><Icon img="img/del.svg" alt="Delete" size="20" padding="5" onClick={() => onFileDelete(file)} /></Td>
 </TbodyTr>
{/snippet}
<div class="file-upload {dropActive ? 'drop-active' : ''}">
 <input type="file" id="fileInput" bind:this={elFileInput} onchange={onFileUpload} multiple style="display: none;" data-testid="file-upload-input" />
 <div class="header">
  <Button width="110px" img="img/add-black.svg" text="Add files" onClick={onFileAdd} />
  <Button width="110px" img="img/del-black.svg" text="Remove all" enabled={$fileUploadModalFiles.length} onClick={onDeleteAll} />
 </div>
 <div class="body" ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop} role="region" aria-label="File drop zone">
  {#if $fileUploadModalFiles.length}
   <div class="items file-table">
    <Table>
     <Thead>
      <TheadTr>
       <Th>File name</Th>
       <Th>Size</Th>
       <Th>Action</Th>
      </TheadTr>
     </Thead>
     <Tbody>
      {#each $fileUploadModalFiles as file}
       {@render fileUploadItem(file)}
      {/each}
     </Tbody>
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
  <Button width="180px" img="modules/{identifier}/img/upload.svg" text="Send peer-to-peer" onClick={uploadP2P} enabled={$fileUploadModalFiles.length} data-testid="send-files-p2p" />
  <Button width="180px" img="modules/{identifier}/img/upload.svg" text="Send to server" onClick={uploadServer} enabled={$fileUploadModalFiles.length} data-testid="send-files-server" />
 </div>
</div>
