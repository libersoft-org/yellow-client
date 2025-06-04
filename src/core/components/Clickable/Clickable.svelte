<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, MouseEventHandler } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		onClick?: MouseEventHandler<HTMLButtonElement>;
		onRightClick?: MouseEventHandler<HTMLButtonElement>;
		onMousedown?: MouseEventHandler<HTMLButtonElement>;
	}

	let { children, onClick, onRightClick, onMousedown, ...restProps }: Props = $props();
</script>

<style>
	.clickable {
		display: flex;
		cursor: pointer;
		align-items: center;
		-webkit-tap-highlight-color: transparent;
	}

	.clickable > :global(*) {
		flex: 1 1 auto;
	}
</style>

<button {...restProps} onclick={onClick} onmousedown={onMousedown} oncontextmenu={onRightClick} class="clickable button-reset">
	{@render children?.()}
</button>
