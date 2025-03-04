<script>
 import Video from './video.svelte';

 let { node, showHiddenImages, hiddenImages, siblings } = $props();
 let file = node.attributes.file?.value;

 const YELLOW_SRC_PROTOCOL = 'yellow:';
 // check str if begins with yellow
 let isYellow = $derived(file && file.startsWith(YELLOW_SRC_PROTOCOL)) // todo: check deep prop reactivity (in case of message edit)
 let yellowId = $derived(isYellow ? file.slice(YELLOW_SRC_PROTOCOL.length) : null)
</script>

<div class="message-content-video-wrapper">
 <Video uploadId={yellowId} />
</div>

<style>
</style>
