<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		expand?: boolean;
		onClick?: MouseEventHandler<HTMLDivElement>;
		onRightClick?: MouseEventHandler<HTMLDivElement>;
		onMousedown?: MouseEventHandler<HTMLDivElement>;
	}
	let { children, expand = false, onClick, onRightClick, onMousedown, ...restProps }: Props = $props();

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.currentTarget as HTMLElement).click();
		if (e.key === ' ') e.preventDefault();
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.key === ' ') (e.currentTarget as HTMLElement).click();
	}
</script>

<style>
	.clickable {
		/*
		display: contents;
	 all: unset;
		*/
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

<div class="clickable" class:expand role="button" tabindex="0" onclick={onClick} onmousedown={onMousedown} oncontextmenu={onRightClick} onkeydown={handleKeyDown} onkeyup={handleKeyUp} {...restProps}>
	{@render children?.()}
</div>
