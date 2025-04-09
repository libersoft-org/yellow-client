<script lang="ts">
 import { onMount } from 'svelte';
 import { cancelDownload, cancelUpload, downloadAttachmentsSerial, loadUploadData, pauseDownload, pauseUpload as _pauseUpload, resumeDownload, resumeUpload as _resumeUpload } from '../../messages.js';
 import { type FileDownload, type FileUpload } from '../../services/fileUpload/types.ts';
 import fileDownloadStore from '../../stores/FileDownloadStore.ts';
 import fileUploadStore from '../../stores/FileUploadStore.ts';
 import { assembleFile } from '../../services/fileUpload/utils.ts';
 import FileView from './FileView.svelte';

 let { uploadId } = $props();

 /** uploads */
 let upload = $state<FileUpload | null>(null);
 fileUploadStore.store.subscribe(() => (upload = fileUploadStore.get(uploadId) || null));

 /** downloads */
 let download = $state<FileDownload | null>(null);
 fileDownloadStore.store.subscribe(() => (download = fileDownloadStore.get(uploadId) || null));

 onMount(() => {
  if (!upload) loadUploadData(uploadId);
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
 <FileView {upload} {download} {onDownload} {changingStatus} {cancelDownload} {cancelUpload} {pauseDownload} {resumeDownload} {pauseUpload} {resumeUpload} />
{/if}
