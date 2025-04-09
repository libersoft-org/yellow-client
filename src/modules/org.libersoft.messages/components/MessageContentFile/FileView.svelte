<script lang="ts">
 import FileTransfer from './FileTransfer.svelte';
 import { identifier } from '../../messages.js';
 import { type FileDownload, type FileUpload, FileUploadRecordErrorType, FileUploadRecordStatus, FileUploadRecordType, FileUploadRole } from '../../services/fileUpload/types.ts';
 import Button from '@/core/components/Button/Button.svelte';
 import { humanSize } from '@/core/utils/fileUtils.js';

 interface AttachmentProps {
  upload: FileUpload;
  download: FileDownload | null;
  pauseUpload: (uploadId: string) => void;
  resumeUpload: (uploadId: string) => void;
  cancelUpload: (uploadId: string) => void;
  resumeDownload: (uploadId: string) => void;
  pauseDownload: (uploadId: string) => void;
  cancelDownload: (uploadId: string) => void;
  onDownload: (e: Event) => void;
  changingStatus: boolean;
 }

 let { upload, download, changingStatus, pauseUpload, resumeUpload, cancelUpload, resumeDownload, pauseDownload, cancelDownload, onDownload }: AttachmentProps = $props();

 const uploadId = $derived(upload ? upload.record.id : null) as string;
 const uploaded = $derived(upload ? Math.min(upload.chunksSent.length * upload.record.chunkSize, upload.record.fileSize) : 0);
 const downloaded = $derived(download ? Math.min(download.chunksReceived.length * download.record.chunkSize, download.record.fileSize) : 0);
 const isUploadActive = $derived(Boolean(upload && upload.file));

 let statusString = $derived.by(() => {
  const record = upload.record;

  if (record.status === FileUploadRecordStatus.BEGUN || record.status === FileUploadRecordStatus.UPLOADING) {
   if (upload.running) {
    return upload.role === FileUploadRole.SENDER ? 'Uploading' : 'Downloading';
   } else {
    return 'Sender is uploading';
   }
  } else if (record.status === FileUploadRecordStatus.PAUSED) {
   return upload.role === FileUploadRole.SENDER ? 'Paused' : 'Paused by sender';
  } else if (record.status === FileUploadRecordStatus.FINISHED) {
   return 'Upload finished';
  } else if (record.status === FileUploadRecordStatus.CANCELED) {
   return 'Upload canceled';
  } else if (record.status === FileUploadRecordStatus.ERROR) {
   if (record.errorType === FileUploadRecordErrorType.TIMEOUT_BY_SERVER) {
    return 'Upload timeout';
   } else {
    return 'Upload error';
   }
  } else {
   return 'Unknown status';
  }
 });
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

{#snippet uploadControls()}
 <div class="transfer-controls">
  {#if upload.record.status === FileUploadRecordStatus.PAUSED}
   <Button img="modules/{identifier}/img/play.svg" onClick={() => resumeUpload(uploadId)} enabled={!changingStatus} />
  {:else}
   <Button img="modules/{identifier}/img/pause.svg" onClick={() => pauseUpload(uploadId)} enabled={!changingStatus} />
  {/if}
  <Button img="img/close-black.svg" onClick={() => cancelUpload(uploadId)} />
 </div>
{/snippet}

{#snippet downloadControls()}
 <!-- -->
 {@const isPausedByServer = upload && upload.record.status === FileUploadRecordStatus.PAUSED && upload.role === FileUploadRole.RECEIVER}
 <div class="transfer-controls">
  {#if download && (download.pausedLocally || !download.running)}
   <Button img="modules/{identifier}/img/play.svg" onClick={() => resumeDownload(uploadId)} enabled={!isPausedByServer} />
  {:else}
   <Button img="modules/{identifier}/img/pause.svg" onClick={() => pauseDownload(uploadId)} enabled={!isPausedByServer} />
  {/if}
  <Button img="img/close-black.svg" onClick={() => cancelDownload(uploadId)} />
 </div>
{/snippet}

{#snippet downloadButton()}
 <div class="message-attachment-accept-btn">
  <Button
   width="110px"
   img="modules/{identifier}/img/download.svg"
   text="Download"
   onClick={e => {
    onDownload(e);
   }}
   data-testid="download-button"
  />
 </div>
{/snippet}

{#snippet fileTitle()}
 {#if upload && upload.record}
  <div class="file-title">
   <strong>{upload.record.fileOriginalName}</strong> ({humanSize(upload.record.fileSize)})
  </div>
 {/if}
{/snippet}

{#snippet errors()}
 {#if upload && upload.record}
  <div class="errors">
   {#if upload.record.errorType === FileUploadRecordErrorType.TIMEOUT_BY_SERVER}
    Upload was canceled by server due to timeout limit
   {:else if upload.record.status === FileUploadRecordStatus.ERROR}
    Upload error
   {:else}
    Unknown error
   {/if}
  </div>
 {/if}
{/snippet}

{#snippet renderSenderUpload()}
 <!-- ACTIVE UPLOAD -->
 {#if [FileUploadRecordStatus.BEGUN, FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.PAUSED].includes(upload.record.status)}
  {#if isUploadActive}
   <FileTransfer {uploaded} total={upload.record.fileSize} status={statusString} />
   {@render uploadControls()}
  {:else}
   <div>File is uploading</div>
  {/if}

  <!-- FINISHED UPLOAD - downloading -->
 {:else if download && upload.record.status === FileUploadRecordStatus.FINISHED}
  <FileTransfer uploaded={downloaded} total={upload.record.fileSize} status={'Downloading'} />
  {@render downloadControls()}

  <!-- FINISHED UPLOAD -->
 {:else if upload.record.status === FileUploadRecordStatus.FINISHED}
  {@render downloadButton()}

  <!-- CANCELED UPLOAD -->
 {:else if upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>Upload canceled</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  {@render errors()}
 {/if}
{/snippet}

{#snippet renderReceiverUpload()}
 <!-- DOWNLOAD DOWNLOADING - receiving -->
 {#if download}
  <FileTransfer uploaded={downloaded} total={upload.record.fileSize} status={statusString} />
  {@render downloadControls()}

  <!-- DOWNLOAD BEGIN/UPLOADING/PAUSED  -->
 {:else if [FileUploadRecordStatus.BEGUN, FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.PAUSED].includes(upload.record.status)}
  <FileTransfer uploaded={upload.uploadedBytes} total={upload.record.fileSize} status={statusString} hideSpeed={true} />

  <!-- DOWNLOAD FINISHED - download again if needed -->
 {:else if upload.record.status === FileUploadRecordStatus.FINISHED}
  {@render downloadButton()}

  <!-- CANCELED UPLOAD -->
 {:else if upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>Canceled by sender</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  {@render errors()}
 {/if}
{/snippet}

{#snippet renderSenderP2P()}
 <!-- ACTIVE P2P UPLOAD BEGUN -->
 {#if upload.record.status === FileUploadRecordStatus.BEGUN}
  <div>Waiting for accept...</div>
  <div class="transfer-controls">
   <!-- @ts-ignore todo: button typing -->
   <Button img="img/close-black.svg" onClick={() => cancelUpload(uploadId)} />
  </div>

  <!-- ACTIVE P2P UPLOAD UPLOADING -->
 {:else if upload.record.status === FileUploadRecordStatus.UPLOADING || upload.record.status === FileUploadRecordStatus.PAUSED}
  {#if isUploadActive}
   <FileTransfer {uploaded} total={upload.record.fileSize} status={statusString} />
   {@render uploadControls()}
  {:else}
   <div>Uploading...</div>
  {/if}

  <!-- FINISHED UPLOAD -->
 {:else if upload.record.status === FileUploadRecordStatus.FINISHED}
  <div>File sent</div>

  <!-- CANCELED UPLOAD -->
 {:else if upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>File transfer has been canceled</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  {@render errors()}
 {/if}
{/snippet}

{#snippet renderReceiverP2P()}
 <!-- P2P DOWNLOADING - receiving -->
 {#if download && (download.record.status === FileUploadRecordStatus.UPLOADING || download.record.status === FileUploadRecordStatus.BEGUN || download.record.status === FileUploadRecordStatus.PAUSED)}
  <FileTransfer uploaded={downloaded} total={upload.record.fileSize} status={statusString} />
  {@render downloadControls()}

  <!-- P2P BEGUN - waiting for accept -->
 {:else if upload.record.status === FileUploadRecordStatus.BEGUN}
  <div class="transfer-controls">
   <Button width="80px" text="Accept" onClick={onDownload} data-testid="p2p-accept-button" />
   <Button width="80px" text="Cancel" onClick={() => cancelDownload(uploadId)} data-testid="p2p-cancel-button" />
  </div>

  <!-- CANCELED UPLOAD -->
 {:else if upload.record.status === FileUploadRecordStatus.CANCELED}
  <div>File transfer has been canceled</div>

  <!-- P2P FINISHED - download again if needed -->
 {:else if upload.record.status === FileUploadRecordStatus.FINISHED}
  <!-- {@render downloadButton()} -->
  <div>File transport has been finished</div>

  <!-- FALLBACK TO ERROR -->
 {:else}
  {@render errors()}
 {/if}
{/snippet}

<!--
 todo: data-testid contains potentially unsafe data; svelte is sanitizing it, but we should consider auto stripping
 data-testid attr for production (since its purpose is only for testing in playwright)
-->
<div class="message-attachment" data-upload-id={uploadId} data-testid={upload.record.fileOriginalName}>
 {#if upload}
  {@render fileTitle()}
  {#if upload.role === FileUploadRole.SENDER && upload.record.type === FileUploadRecordType.SERVER}
   {@render renderSenderUpload()}
  {:else if upload.role === FileUploadRole.SENDER && upload.record.type === FileUploadRecordType.P2P}
   {@render renderSenderP2P()}
  {:else if upload.role === FileUploadRole.RECEIVER && upload.record.type === FileUploadRecordType.SERVER}
   {@render renderReceiverUpload()}
  {:else if upload.role === FileUploadRole.RECEIVER && upload.record.type === FileUploadRecordType.P2P}
   {@render renderReceiverP2P()}
  {:else}
   No role
  {/if}
 {:else}
  No upload data
 {/if}
</div>
