<script lang="ts">
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import { getColorFromCSSToFilter } from '../../utils/colors.js';

	import { current_theme, selected_theme_index } from '../../appearance_store.js';

	//  import { selected_theme_index } from '../../appearance_store.js';
	import { derived } from 'svelte/store';

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

	let filtered_color = $derived(selected_theme_index > -1 || 'filter: ' + getColorFromCSSToFilter(colorVariable) + ';');
</script>

{#snippet icon()}
	<div class="icon {!visibleOnMobile && 'hideOnMobile'} {!visibleOnDesktop && 'hideOnDesktop'}" style="padding: {padding};">
		<img style="width: {size}; height: {size}; min-width: {size}; min-height: {size}; {/* check if theme changed or was edited */ $selected_theme_index > -1 && $current_theme && colorVariable && 'filter: ' + getColorFromCSSToFilter(colorVariable) + ';'}" src={img} draggable={false} {alt} />
	</div>
{/snippet}

{#if img}
	{#if onClick || isButton}
		<BaseButton {onClick} data-testid={dataTestId}>
			{@render icon()}
		</BaseButton>
	{:else}
		<div data-testid={dataTestId}>
			{@render icon()}
		</div>
	{/if}
{/if}

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
