<script lang="ts">
	import Audio from './Audio.svelte';
	import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
	import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
	import { FileUploadRecordStatus, type IFileUpload } from '@/org.libersoft.messages/services/Files/types.ts';
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { activeTransferScope } from '@/org.libersoft.messages/services/Files/accountScope.ts';
	let { node } = $props();
	let file = $derived(node.attributes.file?.value);
	const YELLOW_SRC_PROTOCOL = 'yellow:';
	// check str if begins with yellow
	let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)); // TODO: check deep prop reactivity (in case of message edit)
	let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null);
	let upload = writable<IFileUpload | null>(null);
	const unsubscribeUploadStore = fileUploadStore.store.subscribe((): void => upload.set(fileUploadStore.get(activeTransferScope(yellowId)) || null));

	onDestroy(unsubscribeUploadStore);
</script>

<div class="message-content-audio-wrapper">
	{#if $upload && $upload?.record.status !== FileUploadRecordStatus.FINISHED}
		<MessageContentAttachment node={{ attributes: { id: { value: yellowId } } }} />
	{:else}
		<Audio uploadId={yellowId} />
	{/if}
</div>
