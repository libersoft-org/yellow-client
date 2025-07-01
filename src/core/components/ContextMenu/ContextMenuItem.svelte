<script lang="ts">
	import { getContext } from 'svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		img?: string;
		label?: string;
		colorVariable?: string;
		onClick?: (e: Event) => void;
		testId?: string;
	}
	let { img, label, colorVariable = '--primary-foreground', onClick, testId, ...restProps }: Props = $props();
	let menu = getContext('ContextMenu') as { close: () => void } | undefined;

	function handleClick(e: Event) {
		console.log('handleClick');
		onClick?.(e);
		menu?.close();
	}

	function handleMousedown(event) {
		console.log('context-menu-item mousedown');
		event.preventDefault();
		event.stopPropagation();
	}
</script>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 8px 10px;
		width: 100%;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
	}

	.menu-item:hover {
		background-color: var(--primary-background);
	}

	.img-space {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 8px;
	}

	.label {
		flex-grow: 1;
	}
</style>

<Clickable onClick={handleClick} onMousedown={handleMousedown} data-testid={testId} {...restProps}>
	<div class="menu-item">
		{#if img}
			<div class="img-space">
				<Icon {img} alt={label} {colorVariable} size="24px" padding="0px" />
			</div>
		{/if}
		<div class="label">{label}</div>
	</div>
</Clickable>
