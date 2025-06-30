<script lang="ts">
	import { isMobile } from '@/core/stores.ts';
	import { selectedConversation, photoRadius } from '../../messages.js';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Photo from '@/core/components/Photo/Photo.svelte';
	interface Props {
		closeConversation: () => void;
	}
	let { closeConversation }: Props = $props();

	function clickClose() {
		closeConversation();
	}
</script>

<style>
	.description {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		overflow: hidden;
	}

	.description .visible_name,
	.description .address {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		flex: 1 1 auto;
		min-width: 0;
	}

	.description .visible_name {
		font-weight: bold;
	}

	.description .address {
		font-size: 12px;
	}
</style>

<Bar>
	{#snippet left()}
		{#if $isMobile}
			<Icon testId="profile-bar-back-button" img="img/back.svg" alt="Back" colorVariable="--secondary-foreground" padding="10px" onClick={clickClose} />
		{/if}
		<Photo size="38px" radius={$photoRadius} />
		<div class="description">
			{#if $selectedConversation.visible_name}
				<div class="visible_name">{$selectedConversation.visible_name}</div>
			{/if}
			<div class="address">{$selectedConversation.address}</div>
		</div>
	{/snippet}
	{#snippet right()}
		<Icon img="img/cross.svg" alt="Close" colorVariable="--secondary-foreground" onClick={clickClose} visibleOnMobile={false} />
	{/snippet}
</Bar>
