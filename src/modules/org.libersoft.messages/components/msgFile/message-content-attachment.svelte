<script type="ts">
 import AttachmentContainer from '@/org.libersoft.messages/components/msgFile/FileContainer.svelte';

 let { node /* level, num_siblings */ } = $props();
 let uploadId = $state(node.attributes.id?.value);
</script>

<AttachmentContainer {uploadId} />
