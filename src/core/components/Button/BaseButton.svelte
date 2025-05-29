<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, MouseEventHandler } from 'svelte/elements';

	interface BaseButtonProps extends HTMLButtonAttributes {
		children: Snippet;
		onClick?: MouseEventHandler<HTMLButtonElement>;
		onRightClick?: MouseEventHandler<HTMLButtonElement>;
		onMousedown?: MouseEventHandler<HTMLButtonElement>;
		width?: string;
		align?: 'left' | 'center' | 'right';
		height?: string;
	}

	let { children, onClick, onRightClick, onMousedown, ...restProps }: BaseButtonProps = $props();
</script>

<style>
	.base-button {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;
		-webkit-tap-highlight-color: transparent;
	}
</style>

<button class="base-button button-reset" onclick={onClick} onmousedown={onMousedown} oncontextmenu={onRightClick} style:width={restProps.width || 'auto'} style:justify-content={restProps.align || 'center'} style:height={restProps.height || 'auto'} {...restProps}>
	{@render children()}
</button>
