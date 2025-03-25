<script>
 import Video from './video.svelte';
 import MessageContentAttachment from '../msgFile/message-content-attachment.svelte';
 import fileUploadStore from '../../fileUpload/fileUploadStore.ts';
 import { FileUploadRecordStatus } from '../../fileUpload/types.ts';
 import { writable, get } from 'svelte/store';
 import fileDownloadStore from '../../fileUpload/fileDownloadStore.ts';

 let { node, showHiddenImages, hiddenImages, siblings } = $props();
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
