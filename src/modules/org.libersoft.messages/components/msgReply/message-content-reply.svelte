<script type="ts">
 import ReplyContainer from '@/org.libersoft.messages/components/msgReply/ReplyContainer.svelte';

 let { node /* level, num_siblings */ } = $props();
 let messageUid = $state(node.attributes.id?.value);
</script>

<ReplyContainer {messageUid} />
