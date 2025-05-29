<script lang="ts">
	import Input from '@/core/components/Input/Input.svelte';
	import { conversationsArray, sendMessage } from '../messages';
	import { get } from 'svelte/store';
	import Button from '@/core/components/Button/Button.svelte';
	import type { Conversation } from '../types.ts';
	import forwardMessageStore from '../stores/ForwardMessageStore.ts';

	const fwMsg = forwardMessageStore.getForwardedMessage();
	let search = $state('');

	// TODO: this is simple search, in future we want to at least debounce it or make backend solution for filtering
	let conversations: Conversation[] = $derived.by(() => {
		const conversations = get(conversationsArray) || [];

		if (!search) {
			return conversations;
		}

		return conversations.filter((conversation: Conversation) =>
			conversation?.address?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
		);
	});

	let sentToConversations: Conversation[] = $state([]);

	const onSend = (conversation: Conversation) => {
		sendMessage($fwMsg?.data.message, $fwMsg?.data.format, $fwMsg?.data.acc.deref(), conversation);
		sentToConversations.push(conversation);
	};
</script>

{#snippet conversationItem(conversation: Conversation)}
	{@const wasAlreadySent = sentToConversations.some((c) => c.id === conversation.id)}
	<div class="conversation">
		<div class="conversation-avatar">
			<div class="conversation-avatar-placeholder"></div>
		</div>
		<div class="conversation-name">
			{conversation.address}
		</div>
		<div class="conversation-action">
			<Button enabled={!wasAlreadySent} text={wasAlreadySent ? 'Sent' : 'Send'} onClick={() => onSend(conversation)} />
		</div>
	</div>
{/snippet}

<div class="forward-message">
	<div class="header">
		<Input bind:value={search} placeholder="Search in conversations" />
	</div>
	<div class="conversations">
		{#if conversations && conversations.length}
			{#each conversations as conversation (conversation.id)}
				{@render conversationItem(conversation)}
			{/each}
		{:else}
			<div class="empty-conversations">No conversations were found</div>
		{/if}
	</div>
</div>

<style>
	.empty-conversations {
		display: flex;
		justify-content: center;
		height: 40px;
		align-items: center;
	}

	.header {
		display: flex;
		margin-bottom: 12px;
	}

	.header > :global(input) {
		flex: 1 1 100%;
	}

	.conversation {
		display: flex;
	}

	.conversation {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.conversation-avatar-placeholder {
		flex: 0 0 auto;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background-color: #ccc;
	}

	.conversation-name {
		flex: 1 1 100%;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.conversation-action {
		flex: 0 0 auto;
	}
</style>
