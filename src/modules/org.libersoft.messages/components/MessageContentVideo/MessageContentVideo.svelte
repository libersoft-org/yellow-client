<script lang="ts">
	import VideoContainer from './VideoContainer.svelte';
	import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
	import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	import { FileUploadRecordStatus, type IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	let { node } = $props();
	let file = $derived(node.attributes.file?.value);
	const YELLOW_SRC_PROTOCOL = 'yellow:';
	// check str if begins with yellow
	let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)); // TODO: check deep prop reactivity (in case of message edit)
	let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null);
	let upload = writable<IFileUpload | null>(null);
	const unsubscribeUploadStore = fileUploadStore.store.subscribe((): void => upload.set(fileUploadStore.get(yellowId) || null));

	onDestroy(unsubscribeUploadStore);
</script>

<style>
</style>

<div class="message-content-video-wrapper">
	{#if $upload && $upload?.record.status !== FileUploadRecordStatus.FINISHED}
		<MessageContentAttachment node={{ attributes: { id: { value: yellowId } } }} />
	{:else}
		<VideoContainer uploadId={yellowId} />
	{/if}
</div>
