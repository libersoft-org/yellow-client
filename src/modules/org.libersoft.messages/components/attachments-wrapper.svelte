<script>
 import Button from '../../../core/components/button.svelte';
 import { onMount } from 'svelte';
 import { writable } from 'svelte/store';
 import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole } from '../fileUpload/types.ts';
 import fileUploadStore from '../fileUpload/fileUploadStore.ts';
 import { downloadAttachmentsSerial } from '../messages.js';
 import { assembleFile } from '../fileUpload/utils.ts';

 let { children, node } = $props();
 let ref = writable();
 let attachedUploads = $state([]);
 let attachmentIds = $state([]);

 let downloadableRecords = $derived.by(() => {
  return attachedUploads.filter(upload => {
   return (upload.record.type === FileUploadRecordType.P2P && upload.role === FileUploadRole.RECEIVER && upload.record.status === FileUploadRecordStatus.BEGUN) || (upload.record.type === FileUploadRecordType.SERVER && upload.record.status === FileUploadRecordStatus.FINISHED);
  });
 });

 // determine if the bulk download action should be shown
 let showBulkDownloadAction = $derived(downloadableRecords.length > 1);

 // subscribe to the store to get the uploads
 fileUploadStore.store.subscribe(uploads => {
  if (attachmentIds.length === 0) {
   return;
  }

  attachedUploads = uploads.filter(upload => {
   return attachmentIds.includes(upload.record.id);
  });
 });

 // determine attachments type based on the first attachment
 const uploadRecordType = $derived.by(() => {
  return attachedUploads.length > 0 ? attachedUploads[0].record.type : null;
 });

 function getAttachmentEls() {
  return ref.closest('.attachments-wrap').querySelectorAll('.message-attachment');
 }

 function onAcceptAll() {
  downloadAttachmentsSerial(
   downloadableRecords.map(upload => upload.record),
   download => {
    assembleFile(new Blob(download.chunksReceived, { type: download.record.fileMimeType }), download.record.fileOriginalName);
   }
  );
 }

 onMount(() => {
  getAttachmentEls().forEach(attachmentEl => {
   const uploadId = attachmentEl.getAttribute('data-upload-id');
   attachmentIds.push(uploadId);
  });
 });
</script>

<style>
 .attachments-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .attachments {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 :global(.message.outgoing .message-attachment-accept-btn) {
  display: flex;
  justify-content: right;
 }

 :global(.message.outgoing) .actions {
  display: flex;
  justify-content: right;
 }
</style>

<div class="attachments-wrap" bind:this={ref}>
 <div class="attachments">
  {#each children as child (child.tagUniqueId)}
   {#if child.component}
    <svelte:component this={child.component} {...child.props} />
   {/if}
  {/each}
 </div>
 {#if showBulkDownloadAction}
  <div class="actions">
   <Button width="80px" text={uploadRecordType === FileUploadRecordType.P2P ? 'Accept All' : 'Download All'} onClick={onAcceptAll} />
  </div>
 {/if}
</div>
