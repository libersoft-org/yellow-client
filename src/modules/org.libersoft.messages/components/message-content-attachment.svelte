<script>
 import FileTransfer from './filetransfer.svelte';
 import { derived, get, writable } from 'svelte/store';
 import { onMount } from 'svelte';
 import { cancelUpload, downloadAttachmentSerial, loadUploadData, pauseUpload, resumeUpload } from '../messages.js';
 import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole } from '../fileUpload/types.ts';
 import fileUploadManager from '../fileUpload/FileUploadManager.ts';
 import Button from '../../../core/components/button.svelte';
 import fileDownloadStore from '../fileUpload/fileDownloadStore.ts';
 import fileUploadStore from '../fileUpload/fileUploadStore.ts';

 let { node, level, num_siblings } = $props();
 let uploadId = $state(node.attributes.id?.value);

 /** uploads */
 const upload = writable(null);
 fileUploadStore.store.subscribe($uploads => {
  const found = $uploads[uploadId];
  upload.set(found || null);
 });
 const uploaded = derived(upload, $upload => {
  return $upload ? Math.min($upload.chunksSent.length * $upload.record.chunkSize, $upload.record.fileSize) : 0;
 });
 const isUploadActive = derived(upload, $upload => Boolean($upload && $upload.file));

 /** downloads */
 const download = writable(null);
 fileDownloadStore.store.subscribe($downloads => {
  const found = $downloads[uploadId];
  download.set(found || null);
 });
 const downloaded = derived(download, $download => {
  return $download ? Math.min($download.chunksReceived.length * $download.record.chunkSize, $download.record.fileSize) : 0;
 });

 onMount(() => {
  if (!$upload) {
   loadUploadData(uploadId);
  }
 });

 function onDownload() {
  downloadAttachmentSerial($upload.record);
 }
</script>

<style>
 .transfer-controls {
  display: flex;
  gap: 8px;
 }
</style>

{#snippet transferControls()}
 <div class="transfer-controls">
  {#if $upload.record.status === FileUploadRecordStatus.PAUSED}
   <Button width="80px" text="Resume" onClick={() => resumeUpload(uploadId)} />
  {:else}
   <Button width="80px" text="Pause" onClick={() => pauseUpload(uploadId)} />
  {/if}
  <Button width="80px" text="Cancel" onClick={() => cancelUpload(uploadId)} />
 </div>
{/snippet}

{#snippet downloadButton()}
 <div class="message-attachment-accept-btn">
  <Button width="80px" text="Download" onClick={onDownload} />
 </div>
{/snippet}

{#snippet fileTitle()}
 {#if $upload && $upload.record}
  <div>{$upload.record.fileName}</div>
 {/if}
{/snippet}

{#snippet renderSenderUpload()}
 <!-- ACTIVE UPLOAD -->
 {#if $isUploadActive && ($upload.record.status === FileUploadRecordStatus.BEGUN || $upload.record.status === FileUploadRecordStatus.UPLOADING || $upload.record.status === FileUploadRecordStatus.PAUSED)}
  {$upload.record.status}
  <FileTransfer uploaded={$uploaded} total={$upload.record.fileSize} />
  {@render transferControls()}

  <!-- FINISHED UPLOAD - downloading -->
 {:else if $download && $upload.record.status === FileUploadRecordStatus.FINISHED}
  <FileTransfer uploaded={$downloaded} total={$upload.record.fileSize} download />

  <!-- FINISHED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.FINISHED}
  {@render downloadButton()}

  <!-- CANCELED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>Upload canceled</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  <div>Upload error</div>
 {/if}
{/snippet}

{#snippet renderReceiverUpload()}
 <!-- DOWNLOAD DOWNLOADING - receiving -->
 {#if $download}
  <FileTransfer uploaded={$downloaded} total={$upload.record.fileSize} download />

  <!-- DOWNLOAD BEGUN  -->
 {:else if $upload.record.status === FileUploadRecordStatus.BEGUN || $upload.record.status === FileUploadRecordStatus.UPLOADING}
  <div>File is being uploaded...</div>
  <!-- DOWNLOAD FINISHED - download again if needed -->
 {:else if $upload.record.status === FileUploadRecordStatus.FINISHED}
  {@render downloadButton()}

  <!-- CANCELED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.PAUSED}
  <div>Upload is paused by sender</div>

  <!-- CANCELED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>Canceled by sender</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  <div>Upload error</div>
 {/if}
{/snippet}

{#snippet renderSenderP2P()}
 <!-- ACTIVE P2P UPLOAD BEGUN -->
 {#if $upload.record.status === FileUploadRecordStatus.BEGUN}
  <div>Waiting for accept...</div>

  <!-- ACTIVE P2P UPLOAD UPLOADING -->
 {:else if
  $upload.record.status === FileUploadRecordStatus.UPLOADING
  || $upload.record.status === FileUploadRecordStatus.PAUSED
 }
  {#if $isUploadActive}
   <FileTransfer uploaded={$uploaded} total={$upload.record.fileSize} />
   {@render transferControls()}
  {:else}
   <div>Uploading...</div>
  {/if}

  <!-- FINISHED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.FINISHED}
  <div>File sent</div>

  <!-- CANCELED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>Upload canceled</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  <div>Upload error</div>
 {/if}
{/snippet}

{#snippet renderReceiverP2P()}
 <!-- P2P DOWNLOADING - receiving -->
 {#if $download && ($download.record.status === FileUploadRecordStatus.UPLOADING || $download.record.status === FileUploadRecordStatus.BEGUN || $download.record.status === FileUploadRecordStatus.PAUSED)}
  {#if $download.record.status === FileUploadRecordStatus.PAUSED}
   <div>Upload is paused by sender</div>
  {/if}
  <FileTransfer uploaded={$downloaded} total={$upload.record.fileSize} download />

  <!-- P2P BEGUN - waiting for accept -->
 {:else if $upload.record.status === FileUploadRecordStatus.BEGUN}
  <Button width="80px" text="Accept" onClick={onDownload} />

  <!-- CANCELED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>Canceled by sender</div>

  <!-- P2P FINISHED - download again if needed -->
 {:else if $upload.record.status === FileUploadRecordStatus.FINISHED}
  <!-- {@render downloadButton()} -->
  <div>P2P transport has been finished</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  <div>Upload error</div>
 {/if}
{/snippet}

<div class="message-attachment">
 {#if $upload}
  {@render fileTitle()}
  {#if $upload.role === FileUploadRole.SENDER && $upload.record.type === FileUploadRecordType.SERVER}
   {@render renderSenderUpload()}
  {:else if $upload.role === FileUploadRole.SENDER && $upload.record.type === FileUploadRecordType.P2P}
   {@render renderSenderP2P()}
  {:else if $upload.role === FileUploadRole.RECEIVER && $upload.record.type === FileUploadRecordType.SERVER}
   {@render renderReceiverUpload()}
  {:else if $upload.role === FileUploadRole.RECEIVER && $upload.record.type === FileUploadRecordType.P2P}
   {@render renderReceiverP2P()}
  {:else}
   No role
  {/if}
 {:else}
  No upload data
 {/if}
</div>
