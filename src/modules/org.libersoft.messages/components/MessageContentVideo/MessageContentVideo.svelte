<script lang="ts">
	import VideoContainer from './VideoContainer.svelte';
	import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
	import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	import { FileUploadRecordStatus } from '@/org.libersoft.messages/services/Files/types.ts';
	import { writable } from 'svelte/store';
	let { node } = $props();
	let file = node.attributes.file?.value;
	const YELLOW_SRC_PROTOCOL = 'yellow:';
	// check str if begins with yellow
	let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)); // TODO: check deep prop reactivity (in case of message edit)
	let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null);
	let upload = writable(null);
	fileUploadStore.store.subscribe(() => upload.set(fileUploadStore.get(yellowId) || null));
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
