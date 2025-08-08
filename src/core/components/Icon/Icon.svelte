<script lang="ts">
	import { isMobile } from '@/core/scripts/stores.ts';
	import { current_theme } from '@/core/scripts/themes.ts';
	import { getColorFromCSSToFilter } from '@/core/scripts/utils/colors.js';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		img?: string;
		alt?: string;
		size?: string;
		padding?: string;
		visibleOnMobile?: boolean;
		visibleOnDesktop?: boolean;
		colorVariable?: string;
		onClick?: (e: Event) => void;
		isButton?: boolean;
		enabled?: boolean;
		testId?: string;
	}
	let { img, alt = '', size = '24px', padding = '10px', visibleOnMobile = true, visibleOnDesktop = true, colorVariable, onClick, isButton = false, enabled = true, testId }: Props = $props();
	let filter = $derived.by(() => {
		// dummy use of $current_theme because this needs to be reactive on theme changes
		const t = $current_theme;
		if (colorVariable && t) return 'filter: ' + getColorFromCSSToFilter(colorVariable);
		return '';
	});
</script>

<style>
	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon img {
		display: flex;
		user-select: none;
	}

	.icon img:not(.enabled) {
		cursor: default;
		opacity: 0.5;
	}
</style>

{#snippet icon()}
	<div class="icon" style:padding data-testid={testId}>
		<img class:enabled style:min-width={size} style:min-height={size} style:max-width={size} style:max-height={size} style={filter} src={img} draggable={false} {alt} />
	</div>
{/snippet}
{#if img}
	{#if ($isMobile && visibleOnMobile) || (!$isMobile && visibleOnDesktop)}
		{#if (onClick || isButton) && enabled}
			<Clickable {onClick}>
				{@render icon()}
			</Clickable>
		{:else}
			{@render icon()}
		{/if}
	{/if}
{/if}
