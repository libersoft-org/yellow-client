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
	let elClickable: HTMLDivElement;
	let focused = $state(false);

	export function focus() {
		elClickable?.focus();
		focused = true;
	}

	function handleClick(e: MouseEvent) {
		if (!enabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		focused = false;
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
		if (e.key === 'Enter') {
			focused = false;
			(e.currentTarget as HTMLElement).click();
		}
		if (e.key === ' ') e.preventDefault();
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (!enabled) return;
		if (e.key === ' ') {
			focused = false;
			(e.currentTarget as HTMLElement).click();
		}
	}

	function handleBlur() {
		focused = false;
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

	.clickable:focus-visible,
	.clickable.focused {
		outline: 2px solid var(--primary-harder-background);
		border-radius: 10px;
	}
</style>

<div bind:this={elClickable} class="clickable" class:expand class:focused role="button" tabindex="0" aria-disabled={!enabled} onclick={handleClick} onmousedown={handleMousedown} oncontextmenu={handleRightClick} onkeydown={handleKeyDown} onkeyup={handleKeyUp} onblur={handleBlur} {...restProps}>
	{@render children?.()}
</div>
