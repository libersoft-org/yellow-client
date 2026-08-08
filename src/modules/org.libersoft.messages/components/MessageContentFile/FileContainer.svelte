<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { cancelDownload, cancelUpload, downloadAttachmentsSerial, loadUploadData, pauseDownload, pauseUpload as _pauseUpload, resumeDownload, resumeUpload as _resumeUpload } from '@/org.libersoft.messages/scripts/messages.ts';
	import { type IFileDownload, type IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';
	import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
	import fileDownloadManager, { DOWNLOAD_ERROR_EVENT, type IDownloadErrorEvent } from '@/org.libersoft.messages/services/Files/FileDownloadService.ts';
	import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
	import FileView from '@/org.libersoft.messages/components/MessageContentFile/FileView.svelte';
	import { activeTransferScope, scopeAccountKey } from '@/org.libersoft.messages/services/Files/accountScope.ts';

	let { uploadId } = $props();

	/** uploads */
	let upload = $state<IFileUpload | null>(null);
	const unsubscribeUploadStore = fileUploadStore.store.subscribe((): void => {
		upload = fileUploadStore.get(activeTransferScope(uploadId)) || null;
	});

	/** downloads */
	let download = $state<IFileDownload | null>(null);
	const unsubscribeDownloadStore = fileDownloadStore.store.subscribe((): void => {
		download = fileDownloadStore.get(activeTransferScope(uploadId)) || null;
	});

	/* A terminal failure removes the transfer from the store, so the reason has to be caught from the
	 * event - otherwise a refused download (failed integrity check, server-side cancellation,
	 * exhausted retries) just stops with nothing on screen. */
	let downloadError = $state<string | null>(null);
	const onDownloadError = (event: IDownloadErrorEvent): void => {
		const scope = activeTransferScope(uploadId);
		if (!scope || event.uploadId !== scope.uploadId || event.accountKey !== scopeAccountKey(scope)) return;
		downloadError = event.error.message;
	};
	fileDownloadManager.on(DOWNLOAD_ERROR_EVENT, onDownloadError);

	onMount(() => {
		if (!upload) loadUploadData(activeTransferScope(uploadId));
	});

	onDestroy((): void => {
		unsubscribeUploadStore();
		unsubscribeDownloadStore();
		fileDownloadManager.off(DOWNLOAD_ERROR_EVENT, onDownloadError);
	});

	function onDownload(e: Event): void {
		e.preventDefault();
		e.stopPropagation();

		if (!upload) {
			console.error('Cannot download without upload data.');
			return;
		}

		downloadError = null;
		downloadAttachmentsSerial([upload.record], (finishedDownload: IFileDownload) => {
			assembleFile(new Blob(finishedDownload.chunksReceived, { type: finishedDownload.record.fileMimeType }), finishedDownload.record.fileOriginalName);
		});
	}

	let changingStatus = $state(false);
	const pauseUpload = (): void => {
		changingStatus = true;
		_pauseUpload(uploadId).finally(() => {
			changingStatus = false;
		});
	};
	const resumeUpload = (): void => {
		changingStatus = true;
		_resumeUpload(uploadId).finally(() => {
			changingStatus = false;
		});
	};
</script>

{#if upload}
	<FileView {upload} {download} {downloadError} {onDownload} {changingStatus} {cancelDownload} {cancelUpload} {pauseDownload} {resumeDownload} {pauseUpload} {resumeUpload} />
{/if}
