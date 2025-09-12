<script lang="ts">
	import { onMount } from 'svelte';
	import { downloadAttachmentsSerial } from '@/org.libersoft.messages/scripts/messages.js';
	import { FileUploadRecordStatus, FileUploadRecordType, FileUploadRole, type IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';
	import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
	import Button from '@/core/components/Button/Button.svelte';
	import { get } from 'svelte/store';
	let { children } = $props();
	let ref: HTMLDivElement;
	let attachedUploads = $state<IFileUpload[]>([]);
	let attachmentIds = $state<string[]>([]);
	let downloadableRecords = $derived.by(() => {
		return attachedUploads.filter(upload => {
			return (upload.record.type === FileUploadRecordType.P2P && upload.role === FileUploadRole.RECEIVER && upload.record.status === FileUploadRecordStatus.BEGUN) || (upload.record.type === FileUploadRecordType.SERVER && upload.record.status === FileUploadRecordStatus.FINISHED);
		});
	});

	// determine if the bulk download action should be shown
	let showBulkDownloadAction = $derived(downloadableRecords.length > 1);

	// get the uploads based on present attachment IDs
	$effect(() => {
		const uploads = get(fileUploadStore.store);
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
		return ref?.closest('.attachments-wrap')?.querySelectorAll('.message-attachment');
	}

	function onAcceptAll() {
		downloadAttachmentsSerial(
			downloadableRecords.map(upload => upload.record),
			download => {
				assembleFile(
					new Blob(download.chunksReceived, {
						type: download.record.fileMimeType,
					}),
					download.record.fileOriginalName
				);
			}
		);
	}

	onMount(() => {
		getAttachmentEls()?.forEach(attachmentEl => {
			const uploadId = attachmentEl.getAttribute('data-upload-id');
			if (uploadId) attachmentIds.push(uploadId);
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
				<child.component {...child.props} />
			{/if}
		{/each}
	</div>
	{#if showBulkDownloadAction}
		<div class="actions">
			<Button img={uploadRecordType === FileUploadRecordType.P2P ? 'img/check.svg' : 'img/download.svg'} text={uploadRecordType === FileUploadRecordType.P2P ? 'Accept all' : 'Download all'} onClick={onAcceptAll} />
		</div>
	{/if}
</div>
