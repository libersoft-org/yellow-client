<script lang="ts">
	import AttachmentContainer from './FileContainer.svelte';
	let { node /* level, num_siblings */ } = $props();
	let uploadId = $derived(node.attributes.id?.value);
</script>

<AttachmentContainer {uploadId} />
