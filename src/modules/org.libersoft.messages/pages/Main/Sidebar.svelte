<script>
	import { identifier, conversationsArray, selectConversation } from '../../messages.js';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ScrollButton from '../../components/ScrollButton/ScrollButton.svelte';
	import ConversationListItem from '../../components/Conversation/ConversationListItem.svelte';
	import ModalNewConversation from '../../modals/NewConversation.svelte';
	import Settings from '../../modals/Settings/Settings.svelte';
	import SidebarButton from '@/core/components/Sidebar/SidebarButton.svelte';
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
		//TODO: does not work
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
		z-index: 10;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--secondary-foreground);
		background-color: var(--secondary-background);
		border-bottom: 1px solid var(--secondary-softer-background);
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
			<SidebarButton data-testid="new-conversation-button" img="modules/{identifier}/img/conversation-new.svg" text="New conversation" expand onClick={clickNewConversation} />
			<SidebarButton data-testid="messages-settings-button" img="img/settings.svg" onClick={clickMessagesSettings} />
		</div>
		<div class="items" bind:this={elItems} on:scroll={parseScroll}>
			{#each $conversationsArray as c (c.address)}
				{#key c.address}
					<ConversationListItem {c} {clickItem} />
				{/key}
			{/each}
		</div>
		{#if $conversationsArray.length > 1}
			<ScrollButton visible={scrollButtonVisible} direction right="15px" bottom="10px" onClick={scrollToTop} />
		{/if}
	</div>
	<Modal title="New conversation" body={ModalNewConversation} bind:show={showNewConversationModal} />
	<Settings bind:show={showMessageSettings} />
{/if}
