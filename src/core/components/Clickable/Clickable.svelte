<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		onClick?: MouseEventHandler<HTMLDivElement>;
		onRightClick?: MouseEventHandler<HTMLDivElement>;
		onMousedown?: MouseEventHandler<HTMLDivElement>;
	}
	let { children, onClick, onRightClick, onMousedown, ...restProps }: Props = $props();
</script>

<style>
	.clickable {
		/*
		display: contents;
	 all: unset;
		*/
		cursor: pointer;
	}

	.clickable:focus-visible {
		outline: 2px solid var(--primary-harder-background);
	}
</style>

<div role="button" tabindex="0" onclick={onClick} onmousedown={onMousedown} oncontextmenu={onRightClick} {...restProps} class={['clickable button-reset', restProps.class]}>
	{@render children?.()}
</div>
