<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		expand?: boolean;
		enabled?: boolean;
		onClick?: MouseEventHandler<HTMLDivElement>;
		onRightClick?: MouseEventHandler<HTMLDivElement>;
		onMousedown?: MouseEventHandler<HTMLDivElement>;
		restProps?: HTMLAttributes<HTMLDivElement>;
	}
	let { children, expand = false, enabled = true, onClick, onRightClick, onMousedown, ...restProps }: Props = $props();

	function handleClick(e: MouseEvent) {
		if (!enabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		if (onClick) onClick(e as MouseEvent & { currentTarget: EventTarget & HTMLDivElement });
	}

	function handleRightClick(e: MouseEvent) {
		if (!enabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		if (onRightClick) onRightClick(e as MouseEvent & { currentTarget: EventTarget & HTMLDivElement });
	}

	function handleMousedown(e: MouseEvent) {
		if (!enabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		if (onMousedown) onMousedown(e as MouseEvent & { currentTarget: EventTarget & HTMLDivElement });
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!enabled) return;
		if (e.key === 'Enter') (e.currentTarget as HTMLElement).click();
		if (e.key === ' ') e.preventDefault();
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (!enabled) return;
		if (e.key === ' ') (e.currentTarget as HTMLElement).click();
	}
</script>

<style>
	.clickable {
		cursor: pointer;
	}
	.clickable.expand {
		display: flex;
		flex: 1;
	}

	.clickable:focus-visible {
		outline: 2px solid var(--primary-harder-background);
		border-radius: 10px;
	}
</style>

<div class="clickable" class:expand role="button" tabindex="0" aria-disabled={!enabled} onclick={handleClick} onmousedown={handleMousedown} oncontextmenu={handleRightClick} onkeydown={handleKeyDown} onkeyup={handleKeyUp} {...restProps}>
	{@render children?.()}
</div>
