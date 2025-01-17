<script>
 import FileTransfer from './filetransfer.svelte'
 import fileUploadStore from '../fileUpload/fileUploadStore'
 import { derived, get, writable } from 'svelte/store'
 import { onMount } from 'svelte'
 import { downloadAttachment, loadUploadData } from '../messages.js'
 import { FileUploadRecordStatus, FileUploadRecordType, FileUploadType } from '../fileUpload/types.ts'
 import fileUploadManager from '../fileUpload/FileUploadManager.ts'

 let { node, level, num_siblings } = $props();
 let uploadId = $state(node.attributes.id?.value);
 let downloading = $state(false)

 /** uploads */
 const upload = writable(null);
 fileUploadStore.uploads.subscribe(($uploads) => {
  const found = $uploads.find(upload => upload.record.id === uploadId);
  upload.set(found || null);
 });
 const uploaded = derived(upload, ($upload) => {
  if ($upload) {
   return Math.min($upload.chunksSent.length * $upload.record.chunkSize, $upload.record.fileSize);
  } else {
   return 0;
  }
 });

 /** downloads */
 const download = writable(null);
 fileUploadStore.downloads.subscribe(($downloads) => {
  const found = $downloads.find(download => download.record.id === uploadId);
  download.set(found || null);
 });
 const downloaded = derived(download, ($download) => {
  if ($download) {
   return Math.min($download.chunksReceived.length * $download.record.chunkSize, $download.record.fileSize);
  } else {
   return 0;
  }
 });

 onMount(() => {
  if (!$upload) {
   loadUploadData(uploadId);
  }
 })

 function onDownload() {
  downloading = true
  downloadAttachment($upload.record)
 }

 function pauseUpload () {
  upload.update(upload => {
   upload.paused = true;
   return upload
  })
  fileUploadManager.pauseUpload(uploadId)
 }

 function resumeUpload () {
  upload.update(upload => {
   upload.paused = false;
   return upload
  })
  fileUploadManager.resumeUpload(uploadId)
 }
</script>

{#snippet pauseResume()}
<div>
 {#if !$upload.paused}
  <button onclick={pauseUpload}>Pause</button>
 {:else}
  <button onclick={resumeUpload}>Resume</button>
 {/if}
</div>
{/snippet}

<div>
 {#if $upload}
  {#if $upload.type === FileUploadType.ACTIVE_UPLOAD}
   Upload type: {$upload.record.type}
   {#if $upload.record.type === FileUploadRecordType.SERVER}
    <FileTransfer
     file={$upload.record.fileName}
     uploaded={$uploaded}
     total={$upload.file.size}
    />
    {@render pauseResume()}
   {:else if $upload.record.type === FileUploadRecordType.P2P}
    {#if $upload.record.status === FileUploadRecordStatus.BEGUN}
     <div>Waiting for accept...</div>
    {:else if $upload.record.status === FileUploadRecordStatus.UPLOADING}
     <FileTransfer
      file={$upload.record.fileName}
      uploaded={$uploaded}
      total={$upload.record.fileSize}
     />
     {@render pauseResume()}
    {:else}
     <div>Finished</div>
    {/if}
   {/if}
  {:else if $upload.type === FileUploadType.SENDER}
   sender
  {:else if $upload.type === FileUploadType.RECEIVER}
   {#if downloading}
    <FileTransfer
     file={$upload.record.fileName}
     uploaded={$downloaded}
     total={$upload.record.fileSize}
     download
    />
   {:else}
    <div>{$upload.record.fileName}</div>
     {#if $upload.record.type === FileUploadRecordType.SERVER}
     <div>
      {#if $upload.record.status === FileUploadRecordStatus.FINISHED}
       <button onclick={onDownload}>Download</button>
      {:else}
       <div>File is being uploaded...</div>
      {/if}
     </div>
    {:else if $upload.record.type === FileUploadRecordType.P2P}
      <div>
       <button onclick={onDownload}>Accept</button>
      </div>
    {/if}
   {/if}
  {/if}
 {:else}
  Upload loading...
 {/if}
</div>
