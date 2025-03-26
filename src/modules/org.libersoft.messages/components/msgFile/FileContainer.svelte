<script lang="ts">
 import { onMount } from 'svelte';
 import { cancelDownload, cancelUpload, downloadAttachmentsSerial, loadUploadData, pauseDownload, pauseUpload as _pauseUpload, resumeDownload, resumeUpload as _resumeUpload } from '../../messages.js';
 import { type FileDownload, type FileUpload, } from '../../fileUpload/types.ts';
 import fileDownloadStore from '../../fileUpload/fileDownloadStore.ts';
 import fileUploadStore from '../../fileUpload/fileUploadStore.ts';
 import { assembleFile } from '@/org.libersoft.messages/fileUpload/utils.ts';
 import FileView from "@/org.libersoft.messages/components/msgFile/FileView.svelte";

 let { uploadId } = $props();

 /** uploads */
 let upload = $state<FileUpload | null>(null);
 fileUploadStore.store.subscribe(() => upload = fileUploadStore.get(uploadId) || null);

 /** downloads */
 let download = $state<FileDownload | null>(null);
 fileDownloadStore.store.subscribe(() => download = fileDownloadStore.get(uploadId) || null);

 onMount(() => {
  if (!upload) {
   loadUploadData(uploadId);
  }
 });

 function onDownload(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!upload) {
   console.error('Cannot download without upload data.');
   return;
  }

  downloadAttachmentsSerial([upload.record], (finishedDownload: FileDownload) => {
   assembleFile(new Blob(finishedDownload.chunksReceived, { type: finishedDownload.record.fileMimeType }), finishedDownload.record.fileOriginalName);
  });
 }

 let changingStatus = $state(false);
 const pauseUpload = () => {
  changingStatus = true;
  _pauseUpload(uploadId).finally(() => {
   changingStatus = false;
  });
 };
 const resumeUpload = () => {
  changingStatus = true;
  _resumeUpload(uploadId).finally(() => {
   changingStatus = false;
  });
 };
</script>

{#if upload}
 <FileView
  upload={upload}
  download={download}
  onDownload={onDownload}
  changingStatus={changingStatus}
  cancelDownload={cancelDownload}
  cancelUpload={cancelUpload}
  pauseDownload={pauseDownload}
  resumeDownload={resumeDownload}
  pauseUpload={pauseUpload}
  resumeUpload={resumeUpload}
 />
{/if}
