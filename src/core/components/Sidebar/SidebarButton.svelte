<script lang="ts">
	import { isMobile } from '@/core/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		img?: string;
		imgSize?: string;
		text?: string;
		enabled?: boolean;
		visibleOnMobile?: boolean;
		visibleOnDesktop?: boolean;
		onClick?: (e: Event) => void;
	}
	let { img, imgSize = '20px', text, enabled = true, visibleOnMobile = true, visibleOnDesktop = true, onClick, ...restProps }: Props = $props();

	function handleClick(e) {
		console.log('SidebarButton clicked');
		if (onClick) onClick(e);
	}
</script>

<style>
	.sidebar-button {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		font-weight: bold;
		border-bottom: 1px solid var(--secondary-softer-background);
		color: var(--secondary-foreground);
		cursor: pointer;
		transition: background-color 0.4s linear;
	}

	.sidebar-button.disabled {
		color: var(--disabled-foreground);
	}

	.sidebar-button:not(.disabled):hover {
		background-color: var(--secondary-soft-background);
	}
</style>

{#if img || text}
	{#if ($isMobile && visibleOnMobile) || (!$isMobile && visibleOnDesktop)}
		<Clickable {...restProps} onClick={handleClick}>
			<div class="sidebar-button" class:disabled={!enabled}>
				{#if img}
					<Icon {img} colorVariable={!enabled ? '--disabled-foreground' : '--secondary-foreground'} alt={text} size={imgSize} padding="0px" />
				{/if}
				{#if text}
					<div>{text}</div>
				{/if}
			</div>
		</Clickable>
	{/if}
{/if}
