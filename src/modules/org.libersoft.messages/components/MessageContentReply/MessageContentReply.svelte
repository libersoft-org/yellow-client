<script lang="ts">
	import ReplyContainer from './ReplyContainer.svelte';

	let { node /* level, num_siblings */ } = $props();
	let messageUid = $state(node.attributes.id?.value);
</script>

<ReplyContainer {messageUid} />
