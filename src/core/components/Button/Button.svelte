<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { isMobile } from '@/core/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		img?: string;
		text?: string;
		enabled?: boolean;
		hiddenOnDesktop?: boolean;
		width?: string;
		onClick?: (e: Event) => void;
		padding?: string;
		bgColor?: string;
		hoverColor?: string;
		borderColor?: string;
		textColor?: string;
		expand?: boolean;
		colorVariable?: string;
		iconSize?: string;
		iconPadding?: string;
		loading?: boolean;
		radius?: number;
		right?: boolean;
	}
	let { children, img = '', text = '', enabled = true, hiddenOnDesktop = false, width, onClick, padding = '10px', bgColor = 'var(--primary-background)', hoverColor = 'var(--primary-hard-background)', borderColor = 'var(--primary-harder-background)', textColor = 'var(--primary-foreground)', expand = false, colorVariable = '--primary-foreground', iconSize = '20px', iconPadding = '0px', loading = false, radius = 10, right = false, ...restProps }: Props = $props();
	let elClickable: Clickable;

	function handleClick(e: Event) {
		if (enabled && onClick) onClick(e);
	}

	export function focus() {
		elClickable?.focus();
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
		box-sizing: border-box;
		transition: background-color 0.4s linear;
	}

	.button:hover:not(.disabled),
	:global(.clickable:focus-visible) .button:not(.disabled),
	:global(.clickable.focused) .button:not(.disabled) {
		background-color: var(--button-hover-color) !important;
	}

	.button.disabled {
		background-color: var(--disabled-background) !important;
		border-color: var(--disabled-foreground) !important;
		color: var(--disabled-foreground) !important;
	}

	.button.hidden-on-desktop {
		display: none;
	}

	.button .text {
		white-space: nowrap;
	}
</style>

{#snippet icon()}
	<Icon {img} colorVariable={!enabled ? '--disabled-foreground' : colorVariable} alt={text} size={iconSize} padding={iconPadding} />
{/snippet}
<Clickable bind:this={elClickable} {...restProps} onClick={handleClick} {enabled}>
	<div class="button" class:disabled={!enabled} class:hidden-on-desktop={!$isMobile && hiddenOnDesktop} style:width style:padding style:border-radius={radius + 'px'} style:background-color={bgColor} style:color={textColor} style:border-color={borderColor} style:flex-grow={expand ? '1' : undefined} style:--button-hover-color={hoverColor}>
		{#if children}
			{@render children?.()}
		{/if}
		{#if loading}
			<Spinner size="0px" containerMinHeight="auto" />
		{:else}
			{#if img && !right}
				{@render icon()}
			{/if}
			{#if text}
				<div class="text">{text}</div>
			{/if}
			{#if img && right}
				{@render icon()}
			{/if}
		{/if}
	</div>
</Clickable>
