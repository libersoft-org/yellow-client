<script>
 import Video from './Video.svelte';
 import MessageContentAttachment from '../MessageContentFile/MessageContentAttachment.svelte';
 import fileUploadStore from '../../stores/FileUploadStore.ts';
 import { FileUploadRecordStatus } from '../../services/fileUpload/types.ts';
 import { writable } from 'svelte/store';
 //import fileDownloadStore from '../stores/FileDownloadStore.ts';
 let { node } = $props();
 let file = node.attributes.file?.value;
 const YELLOW_SRC_PROTOCOL = 'yellow:';
 // check str if begins with yellow
 let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)); // todo: check deep prop reactivity (in case of message edit)
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
  <Video uploadId={yellowId} />
 {/if}
</div>
