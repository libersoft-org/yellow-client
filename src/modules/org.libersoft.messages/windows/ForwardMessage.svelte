<script lang="ts">
	import { get } from 'svelte/store';
	import { photoRadius } from '@/org.libersoft.messages/scripts/messages.js';
	import { conversationsArray, sendMessage, processMessage, identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import type { Conversation } from '@/org.libersoft.messages/scripts/types.js';
	import { forwardMessageStore } from '@/org.libersoft.messages/stores/ForwardMessageStore.js';
	import Input from '@/core/components/Input/Input.svelte';
	import Photo from '@/core/components/Photo/Photo.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import MessageContent from '@/org.libersoft.messages/components/MessageContent/MessageContent.svelte';
	const fwMsg = forwardMessageStore.getForwardedMessage();
	const sentToConversations = forwardMessageStore.getSentToConversations();
	let search = $state('');
	// Process the message to get the content for preview
	let messageContent = $derived($fwMsg ? processMessage($fwMsg.data) : null);
	// TODO: this is simple search, in future we want to at least debounce it or make backend solution for filtering
	let conversations: Conversation[] = $derived.by(() => {
		const allConversations = get(conversationsArray) || [];
		const searchTerm = search.trim();
		if (!searchTerm) return allConversations;
		return allConversations.filter((conversation: Conversation) => {
			return conversation?.address?.toLowerCase()?.includes(searchTerm.toLowerCase());
		});
	});

	const onSend = (conversation: Conversation) => {
		sendMessage($fwMsg?.data.message, $fwMsg?.data.format, $fwMsg?.data.acc.deref(), conversation);
		forwardMessageStore.addSentToConversation(conversation);
	};
</script>

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

	.conversation-name {
		flex: 1 1 100%;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.conversation-action {
		flex: 0 0 auto;
	}

	.message-preview {
		margin-bottom: 16px;
		padding: 12px;
		background-color: var(--color-surface);
		border-radius: 8px;
		border: 1px solid var(--color-border);
	}

	.message-preview-header {
		font-size: 14px;
		font-weight: bold;
		color: var(--color-text-secondary);
		margin-bottom: 8px;
	}

	.message-preview-content {
		font-size: 14px;
		color: var(--color-text);
		max-height: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>

{#snippet conversationItem(conversation: Conversation)}
	{@const wasAlreadySent = $sentToConversations.some(c => c.id === conversation.id)}
	<div class="conversation" data-testid="forward-conversation-item-{conversation.address}">
		<Photo size="30px" radius={$photoRadius} />
		<div class="conversation-name" data-testid="forward-conversation-name-{conversation.address}">
			{conversation.address}
		</div>
		<div class="conversation-action">
			<Button img="modules/{identifier}/img/send.svg" enabled={!wasAlreadySent} text={wasAlreadySent ? 'Sent' : 'Send'} onClick={() => onSend(conversation)} data-testid="forward-conversation-send-{conversation.address}" />
		</div>
	</div>
{/snippet}
<div class="forward-message" data-testid="forward-message-window">
	{#if $fwMsg && messageContent}
		<div class="message-preview" data-testid="forward-message-preview">
			<div class="message-preview-header" data-testid="forward-message-preview-header">Forwarding message:</div>
			<div class="message-preview-content" data-testid="forward-message-preview-content">
				<MessageContent {messageContent} />
			</div>
		</div>
	{/if}
	<div class="header">
		<Input bind:value={search} placeholder="Search in conversations" data-testid="forward-message-search" />
	</div>
	<div class="conversations" data-testid="forward-message-conversations">
		{#if conversations && conversations.length}
			{#each conversations as conversation (conversation.address)}
				{@render conversationItem(conversation)}
			{/each}
		{:else}
			<div class="empty-conversations" data-testid="forward-message-no-conversations">No conversations were found</div>
		{/if}
	</div>
</div>
