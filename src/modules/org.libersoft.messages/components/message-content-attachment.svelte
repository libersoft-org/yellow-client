<script>
 import FileTransfer from './filetransfer.svelte';
 import { derived, writable } from 'svelte/store';
 import { onMount } from 'svelte';
 import { identifier, cancelDownload, cancelUpload, downloadAttachmentsSerial, loadUploadData, pauseDownload, pauseUpload, resumeDownload, resumeUpload } from '../messages.js';
 import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole } from '../fileUpload/types.ts';
 //import fileUploadManager from '../fileUpload/FileUploadManager.ts';
 import Button from '../../../core/components/button.svelte';
 import fileDownloadStore from '../fileUpload/fileDownloadStore.ts';
 import fileUploadStore from '../fileUpload/fileUploadStore.ts';
 import { humanSize } from '../../../core/utils/file.utils.js';

 //let { node, level, num_siblings } = $props();
 let { node } = $props();
 let uploadId = $state(node.attributes.id?.value);

 /** uploads */
 const upload = writable(null);
 fileUploadStore.store.subscribe(() => upload.set(fileUploadStore.get(uploadId) || null));
 const uploaded = derived(upload, $upload => {
  return $upload ? Math.min($upload.chunksSent.length * $upload.record.chunkSize, $upload.record.fileSize) : 0;
 });
 const isUploadActive = derived(upload, $upload => Boolean($upload && $upload.file));

 /** downloads */
 const download = writable(null);
 fileDownloadStore.store.subscribe(() => download.set(fileDownloadStore.get(uploadId) || null));
 const downloaded = derived(download, $download => {
  return $download ? Math.min($download.chunksReceived.length * $download.record.chunkSize, $download.record.fileSize) : 0;
 });

 onMount(() => {
  if (!$upload) {
   loadUploadData(uploadId);
  }
 });

 function onDownload() {
  downloadAttachmentsSerial([$upload.record]);
 }
</script>

<style>
 .message-attachment {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid #880;

  border-radius: 10px;
  background-color: #ffd;
 }

 .transfer-controls {
  display: flex;
  gap: 10px;
 }

 .file-title {
  margin-bottom: 6px;
 }
</style>

{#snippet transferControls()}
 <div class="transfer-controls">
  {#if $upload.record.status === FileUploadRecordStatus.PAUSED || !$upload.running}
   <Button img="modules/{identifier}/img/play.svg" onClick={() => resumeUpload(uploadId)} />
  {:else}
   <Button img="modules/{identifier}/img/pause.svg" onClick={() => pauseUpload(uploadId)} />
  {/if}
  <Button img="img/close-black.svg" onClick={() => cancelUpload(uploadId)} />
 </div>
{/snippet}

{#snippet downloadControls()}
 <div class="transfer-controls">
  {#if $download && ($download.pausedLocally || !$download.running)}
   <Button img="modules/{identifier}/img/play.svg" onClick={() => resumeDownload(uploadId)} />
  {:else}
   <Button img="modules/{identifier}/img/pause.svg" onClick={() => pauseDownload(uploadId)} />
  {/if}
  <Button img="img/close-black.svg" onClick={() => cancelDownload(uploadId)} />
 </div>
{/snippet}

{#snippet downloadButton()}
 <div class="message-attachment-accept-btn">
  <Button width="110px" img="modules/{identifier}/img/download.svg" text="Download" onClick={onDownload} />
 </div>
{/snippet}

{#snippet fileTitle()}
 {#if $upload && $upload.record}
  <div class="file-title">
   <strong>{$upload.record.fileName}</strong> ({humanSize($upload.record.fileSize)})
  </div>
 {/if}
{/snippet}

{#snippet renderSenderUpload()}
 <!-- ACTIVE UPLOAD -->
 {#if $upload.record.status === FileUploadRecordStatus.BEGUN || $upload.record.status === FileUploadRecordStatus.UPLOADING || $upload.record.status === FileUploadRecordStatus.PAUSED}
  {#if $isUploadActive}
   <FileTransfer uploaded={$uploaded} total={$upload.record.fileSize} />
   {@render transferControls()}
  {:else}
   <div>File is uploading</div>
  {/if}

  <!-- FINISHED UPLOAD - downloading -->
 {:else if $download && $upload.record.status === FileUploadRecordStatus.FINISHED}
  <FileTransfer uploaded={$downloaded} total={$upload.record.fileSize} download />
  {@render downloadControls()}

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
  {@render downloadControls()}

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
 {:else if $upload.record.status === FileUploadRecordStatus.UPLOADING || $upload.record.status === FileUploadRecordStatus.PAUSED}
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
  <div>File transfer has been canceled</div>

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
  {@render downloadControls()}

  <!-- P2P BEGUN - waiting for accept -->
 {:else if $upload.record.status === FileUploadRecordStatus.BEGUN}
  <div class="transfer-controls">
   <Button width="80px" text="Accept" onClick={onDownload} />
   <Button width="80px" text="Cancel" onClick={() => cancelDownload(uploadId)} />
  </div>

  <!-- CANCELED UPLOAD -->
 {:else if $upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>File transfer has been canceled</div>

  <!-- P2P FINISHED - download again if needed -->
 {:else if $upload.record.status === FileUploadRecordStatus.FINISHED}
  <!-- {@render downloadButton()} -->
  <div>File transport has been finished</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  <div>Upload error</div>
 {/if}
{/snippet}

<div class="message-attachment" data-upload-id={uploadId}>
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
