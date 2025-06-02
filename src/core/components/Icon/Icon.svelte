<script lang="ts">
	import BaseButton from '@/core/components/BaseButton/BaseButton.svelte';
	import { getColorFromCSSToFilter } from '../../utils/colors.js';
	import { current_theme } from '../../appearance_store.js';

	interface Props {
		img: string;
		alt?: string;
		size?: string;
		padding?: string;
		visibleOnMobile?: boolean;
		visibleOnDesktop?: boolean;
		colorVariable?: string;
		onClick?: () => void;
		isButton?: boolean;
		'data-testid'?: string;
	}

	let { img, alt = '', size = '24px', padding = '10px', visibleOnMobile = true, visibleOnDesktop = true, colorVariable, onClick, isButton = false, 'data-testid': dataTestId }: Props = $props();

	let filter = $derived.by(() => {
		// dummy use of $current_theme because this needs to be reactive on theme changes
		const t = $current_theme;
		//console.log('colorVariable', colorVariable, 'current_theme', t);
		if (colorVariable && t) {
			return 'filter: ' + getColorFromCSSToFilter(colorVariable);
		}
		return '';
	});
</script>

<style>
	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
	}

	.icon img {
		display: flex;
		user-select: none;
	}

	@media (max-width: 767px) {
		.hideOnMobile {
			display: none;
		}
	}

	@media (min-width: 768px) {
		.hideOnDesktop {
			display: none;
		}
	}
</style>

{#snippet icon()}
	<div class="icon {!visibleOnMobile && 'hideOnMobile'} {!visibleOnDesktop && 'hideOnDesktop'}" style="padding: {padding};">
		<img style="width: {size}; height: {size}; min-width: {size}; min-height: {size}; {filter};" src={img} draggable={false} {alt} />
	</div>
{/snippet}

{#if img}
	{#if onClick || isButton}
		<BaseButton {onClick} data-testid={dataTestId}>
			{@render icon()}
		</BaseButton>
	{:else}
		{@render icon()}
	{/if}
{/if}
