<script>
 import Button from '../../../core/components/button.svelte';
 import { onMount } from "svelte";
 import { writable } from "svelte/store";
 import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole } from "../fileUpload/types.ts";
 import fileUploadStore from "../fileUpload/fileUploadStore.ts";
 import { downloadAttachmentsSerial } from "../messages.js";

 let { children, node } = $props();
 let ref = writable()
 let uploadRecordType = $state('')
 const uploads = $state([])

 let show = $derived.by(() => {
  const downloadableRecords = uploads.filter(upload => {
   return (
    upload.record.type === FileUploadRecordType.P2P && upload.role === FileUploadRole.RECEIVER
    && upload.record.status === FileUploadRecordStatus.BEGUN
   ) || (
    upload.record.type === FileUploadRecordType.SERVER && upload.record.status === FileUploadRecordStatus.FINISHED
   )
  });
  console.warn('FFF', downloadableRecords);
  return downloadableRecords.length > 1;
 })

 function getAttachmentEls () {
  console.log('ref', ref);
  return ref.closest('.attachments-wrap').querySelectorAll('.message-attachment');
 }

 function onAcceptAll() {
  downloadAttachmentsSerial(getUploads().map(upload => upload.record));
 }

 const getUploads = () => {
  const uploadsSet = [];
  getAttachmentEls().forEach(attachmentEl => {
   const uploadId = attachmentEl.getAttribute('data-upload-id');
   const upload = fileUploadStore.get(uploadId);
   if (upload) {
    uploadsSet.push(upload);
   }
  });
  return uploadsSet;
 }

 onMount(() => {
  const attachmentEls = getAttachmentEls();
  if (attachmentEls && attachmentEls.length) {
   // derive upload record type from first attachment
   const uploadId = attachmentEls[0].getAttribute('data-upload-id');
   const upload = fileUploadStore.get(uploadId);
   if (upload) {
    uploadRecordType = upload.record.type;
   }

   // get all uploads
   attachmentEls.forEach(attachmentEl => {
    const uploadId = attachmentEl.getAttribute('data-upload-id');
    const upload = fileUploadStore.get(uploadId);
    if (upload) {
     uploads.push(upload);
    }
   });
  }
 })
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
  {@render children?.()}
 </div>
 {#if show}
 <div class="actions">
  <Button width="80px" text={uploadRecordType === FileUploadRecordType.P2P ? 'Accept All' : 'Download All'} onClick={onAcceptAll} />
 </div>
 {/if}
</div>
