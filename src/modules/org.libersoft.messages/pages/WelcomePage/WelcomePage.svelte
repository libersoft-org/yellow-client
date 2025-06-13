<script>
	import { active_account, setModule } from '@/core/core.ts';
	import { hideSidebarMobile } from '@/core/stores.ts';
	import { identifier, online } from '../../messages.js';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalNewConversation from '../../modals/NewConversation.svelte';
	const illustrations = ['man', 'woman', 'pigeon'];
	let showNewConversationModal = false;

	function clickNew() {
		showNewConversationModal = true;
	}

	function back() {
		hideSidebarMobile.set(false);
	}

	function close() {
		setModule(null);
	}
</script>

<style>
	.welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		height: 100vh;
		background: var(--background-image) 0 0 / 400px repeat;
	}

	.welcome .illustration {
		width: 350px;
		max-width: calc(100% - 20px);
		height: 350px;
		max-height: calc(100% - 20px);
	}

	.welcome .label {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px;
		border: 1px solid var(--default-foreground);
		border-radius: 20px;
		text-align: center;
		font-size: 20px;
		background-color: var(--default-background);
		color: var(--primary-foreground);
	}
</style>

<Bar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<BarTitle text="Messages" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/close.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</Bar>

<div class="welcome">
	<img class="illustration" src="modules/{identifier}/img/illustration-{illustrations[Math.floor(Math.random() * illustrations.length)]}.svg" alt="Illustration" />
	<div class="label">
		{#if $online}
			<div>Select your conversation<br />or</div>
			<Button text="Start a new one" padding="5px" onClick={clickNew} />
		{:else if $active_account}
			<div>This module is offline</div>
		{:else}
			<div>Select account...</div>
		{/if}
	</div>
</div>
<Modal title="New Conversation" body={ModalNewConversation} bind:show={showNewConversationModal} />
