<script lang="ts">
	import ReplyView from './ReplyView.svelte';
	import { onMount } from 'svelte';
	import { getMessageByUid } from '@/org.libersoft.messages/scripts/messages.js';

	interface Props {
		messageUid: string;
	}

	let { messageUid }: Props = $props();
	let message = $state<any>(null);
	let loading = $state(false);

	onMount(() => {
		loading = true;
		getMessageByUid(messageUid)
			.then(repliedMessage => {
				message = repliedMessage;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<ReplyView address={loading ? 'Reply' : message?.address_to} text={loading ? 'Loading' : message?.message} uid={messageUid} />
