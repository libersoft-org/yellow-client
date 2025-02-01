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
 const { params } = $props();
 let elFileInput; // refs
 let files = $state([]); // store
 let dropActive = $state(false);

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
  elFileInput.value = ''; // clear the file input
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
  let droppedFiles = e.dataTransfer.files;
  for (let i = 0; i < droppedFiles.length; i++) {
   files.push(droppedFiles[i]);
  }
 }
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
 }

 .body .items-empty {
  padding: 50px;
  text-align: center;
  background-color: #eee;
  border: 1px dashed #888;
  border-radius: 10px;
 }

 .items-empty.drop-active {
  background-color: #ddd;
  border-color: #555;
 }

 .footer {
  display: flex;
  gap: 10px;
  justify-content: space-between;
 }
</style>

{#snippet fileUploadItem(file)}
 <TbodyTr>
  <Td>{truncateText(file.name, 30)}</Td>
  <Td>{humanSize(file.size)}</Td>
  <Td><Icon img="img/del.svg" alt="Delete" size="20" padding="5" onClick={() => onFileDelete(file)} /></Td>
 </TbodyTr>
{/snippet}
<div class="file-upload">
 <input type="file" id="fileInput" bind:this={elFileInput} onchange={onFileUpload} multiple style="display: none;" />
 <div class="header">
  <Button width="110px" img="img/add-black.svg" text="Add files" onClick={onFileAdd} />
  <Button width="110px" img="img/del-black.svg" text="Remove all" enabled={files.length} onClick={onDeleteAll} />
 </div>
 <div class="body">
  {#if files.length}
   <div class="items">
    <Table>
     <Thead>
      <TheadTr>
       <Th>File name</Th>
       <Th>Size</Th>
       <Th>Action</Th>
      </TheadTr>
     </Thead>
     <Tbody>
      {#each files as file}
       {@render fileUploadItem(file)}
      {/each}
     </Tbody>
    </Table>
   </div>
  {:else}
   <BaseButton onClick={onFileAdd}>
    <div class="items-empty {dropActive ? 'drop-active' : ''}" role="none" ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
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
