<script lang="ts">
	import { active_account, setModule } from '@/core/scripts/core.ts';
	import { hideSidebarMobile } from '@/core/scripts/stores.ts';
	import { identifier, online, elModalNewConversation } from '@/org.libersoft.messages/scripts/messages.js';
	import Content from '@/core/components/Content/Content.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	const illustrations = ['man', 'woman', 'pigeon'];

	function clickNew() {
		$elModalNewConversation?.open();
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
		gap: 10px;
	}

	.illustration {
		width: 350px;
		max-width: 100%;
		height: 350px;
		max-height: 100%;
		box-sizing: border-box;
	}

	.label {
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

<Content>
	<Bar>
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Messages" />
		{/snippet}
		{#snippet right()}
			<Icon img="img/cross.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<Page hAlign="center" vAlign="center">
		<div class="welcome">
			<img class="illustration" src="modules/{identifier}/img/illustration-{illustrations[Math.floor(Math.random() * illustrations.length)]}.svg" alt="Illustration" />
			<div class="label">
				{#if $online}
					<div>Select your conversation<br />or</div>
					<Button img="modules/{identifier}/img/conversation-new.svg" text="Start a new one" padding="5px" onClick={clickNew} data-testid="new-conversation-button" />
				{:else if $active_account}
					<div>This module is offline</div>
				{:else}
					<div>Select account...</div>
				{/if}
			</div>
		</div>
	</Page>
</Content>
