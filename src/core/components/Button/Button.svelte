<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import BaseButton from '../BaseButton/BaseButton.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface ButtonProps extends HTMLButtonAttributes {
		children?: Snippet;
		img?: string;
		text?: string;
		enabled?: boolean;
		hiddenOnDesktop?: boolean;
		width?: string;
		onClick?: (e: Event) => void;
		padding?: string;
		bgColor?: string;
		borderColor?: string;
		textColor?: string;
		expand?: boolean;
		colorVariable?: string;
		iconSize?: string;
		iconPadding?: string;
		loading?: boolean;
		radius?: number;
	}

	let { children, img = '', text = '', enabled = true, hiddenOnDesktop = false, width, onClick, radius = 10, padding = '10px', bgColor = 'var(--primary-background)', borderColor = 'var(--primary-harder-background)', textColor = 'var(--primary-foreground)', expand = false, colorVariable, iconSize = '20px', iconPadding = '0px', loading = false, ...restProps }: ButtonProps = $props();

	function handleClick(e) {
		if (enabled && onClick) {
			onClick(e);
		}
	}
</script>

<style>
	.button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		text-align: center;
		font-weight: bold;
		border: 1px solid;
		border-radius: 10px;
		-webkit-tap-highlight-color: transparent;
	}

	.button.disabled {
		background-color: var(--disabled-background) !important;
		border-color: var(--disabled-foreground) !important;
		color: var(--disabled-foreground) !important;
		cursor: default;
	}

	@media (min-width: 769px) {
		.hidden-on-desktop {
			display: none;
		}
	}
</style>

<BaseButton {...restProps} onClick={handleClick} disabled={!enabled}>
	<div class="button" class:disabled={!enabled} class:hidden-on-desktop={hiddenOnDesktop} style:width style:padding style:border-radius={radius + 'px'} style:background-color={bgColor} style:color={textColor} style:border-color={borderColor} style:flex-grow={expand ? '1' : undefined}>
		{#if children}
			{@render children?.()}
		{/if}
		{#if loading}
			<Spinner size="0px" containerMinHeight="auto" />
		{:else}
			{#if img}
				<Icon {img} colorVariable={!enabled ? '--disabled-foreground' : colorVariable} alt={text} size={iconSize} padding={iconPadding} />
			{/if}
			{#if text}
				<div>{text}</div>
			{/if}
		{/if}
	</div>
</BaseButton>
