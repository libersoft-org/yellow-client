<script>
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Photo from '../Photo/Photo.svelte';
	import { selectedConversation } from '../../messages.js';
	import { isMobile } from '@/core/core.js';
	export let closeConversation;

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

<TopBar>
	<svelte:fragment slot="left">
		{#if $isMobile}
			<Icon img="img/back.svg" alt="Back" colorVariable="--color-default-background" padding="10px" onClick={clickClose} />
		{/if}
		<Photo size="38px" />
		<div class="description">
			{#if $selectedConversation.visible_name}
				<div class="visible_name">{$selectedConversation.visible_name}</div>
			{/if}
			<div class="address">{$selectedConversation.address}</div>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="right">
		<Icon img="img/close.svg" alt="Close" colorVariable="--color-default-background" onClick={clickClose} visibleOnMobile={false} />
	</svelte:fragment>
</TopBar>
