<script>
	import { getContext } from 'svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let { img = null, label = '', colorVariable = '--primary-foreground', onClick, ...restProps } = $props();
	let menu = getContext('ContextMenu');

	function handleClick() {
		console.log('handleClick');
		onClick();
		menu.close();
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
		padding: 8px 12px;
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

<Clickable onClick={handleClick} onMousedown={handleMousedown} {...restProps}>
	<div class="menu-item">
		{#if img}
			<div class="img-space">
				<Icon {img} alt={label} {colorVariable} size="24px" padding="0px" />
			</div>
		{/if}
		<div class="label">{label}</div>
	</div>
</Clickable>
