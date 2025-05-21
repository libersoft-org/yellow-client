<script>
 import Audio from './Audio.svelte';
 import MessageContentAttachment from '@/org.libersoft.messages/components/MessageContentFile/MessageContentAttachment.svelte';
 import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
 import { FileUploadRecordStatus } from '@/org.libersoft.messages/services/Files/types.ts';
 import { writable, get } from 'svelte/store';
 import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
 import { identifier } from '../../messages.js';

 let { node } = $props();
 let file = node.attributes.file?.value;

 const YELLOW_SRC_PROTOCOL = 'yellow:';
 // check str if begins with yellow
 let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)); // TODO: check deep prop reactivity (in case of message edit)
 let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null);
 let upload = writable(null);
 fileUploadStore.store.subscribe(() => upload.set(fileUploadStore.get(yellowId) || null));
</script>

<div class="message-content-audio-wrapper">
 {#if $upload && $upload?.record.status !== FileUploadRecordStatus.FINISHED}
  <MessageContentAttachment node={{ attributes: { id: { value: yellowId } } }} />
 {:else}
  <Audio uploadId={yellowId} />
 {/if}
</div>
