<script>
	import { identifier, conversationsArray, selectConversation } from '../../messages.js';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ScrollButton from '../../components/ScrollButton/ScrollButton.svelte';
	import ModalNewConversation from '../../modals/NewConversation.svelte';
	import ModalMessageSettings from '../../modals/MessageSettings.svelte';
	import ConversationListItem from '../../components/Conversation/ConversationListItem.svelte';
	let showNewConversationModal = false;
	let showMessageSettings = false;
	let scrollButtonVisible;
	let elItems;
	let scrolled = false;

	$: scrollButtonVisible = scrolled;

	function parseScroll(event) {
		scrolled = elItems?.scrollTop > 0;
		//console.log('elItems?.scrollTop:', elItems?.scrollTop);
	}

	function clickNewConversation() {
		showNewConversationModal = true;
	}

	function clickMessagesSettings() {
		showMessageSettings = true;
	}

	function clickItem(conversation) {
		selectConversation(conversation);
	}

	function scrollToTop() {
		//TODO does not work
		elItems.scrollTop = 0;
	}
</script>

<style>
	.conversations {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.bar-buttons {
		position: relative;
		z-index: 10;
		display: flex;
		color: var(--secondary-foreground);
		background-color: var(--secondary-background);
		border-bottom: 1px solid var(--secondary-softer-background);
	}

	.bar-buttons .bar-button {
		display: flex;
		align-items: center;
		gap: 8px;
		word-break: break-word;
		overflow: hidden;
		padding: 15px;
		padding-right: 0;
		font-weight: bold;

		:global(.base-button) {
			flex: 1 1 auto;
			min-width: 0;
		}
	}

	.bar-buttons .bar-button.grow {
		flex: 1;
	}

	.new-conversation {
		height: fit-content;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		width: 100%;
		/* max-width: 100%; */
	}

	.items {
		display: flex;
		flex-direction: column;
		max-height: 100%;
		overflow-y: auto;
	}
</style>

{#if $conversationsArray != null}
	<div class="conversations">
		<div class="bar-buttons">
			<div class="bar-button grow">
				<BaseButton data-testid="new-conversation-button" onClick={clickNewConversation}>
					<Icon img="modules/{identifier}/img/conversation-new.svg" alt="New conversation" colorVariable="--secondary-foreground" size="28px" padding="0px" />
					<div class="new-conversation">New conversation</div>
				</BaseButton>
			</div>
			<Icon data-testid="messages-settings-button" img="img/settings.svg" alt="Messages settings" colorVariable="--secondary-foreground" size="28px" padding="10px" onClick={clickMessagesSettings} />
		</div>
		<div class="items" bind:this={elItems} on:scroll={parseScroll}>
			{#each $conversationsArray as c (c.address)}
				{#key c.address}
					<ConversationListItem {c} {clickItem} />
				{/key}
			{/each}
		</div>
		{#if $conversationsArray.length > 1}
			<ScrollButton visible={scrollButtonVisible} direction={true} right="15px" bottom="10px" onClick={scrollToTop} />
		{/if}
	</div>
	<Modal title="New Conversation" body={ModalNewConversation} bind:show={showNewConversationModal} />
	<Modal title="Messages settings" body={ModalMessageSettings} bind:show={showMessageSettings} width="300px" />
{/if}
