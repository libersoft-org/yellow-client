<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let visible = true;
	export let direction = false;
	export let left;
	export let right;
	export let top;
	export let bottom;
	export let onClick;
	let size = 30;
</script>

<style>
	.scroll-button {
		z-index: 1;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--size);
		width: var(--size);
		min-height: var(--size);
		height: var(--size);
		padding: 10px;
		border: 1px solid var(--default-foreground);
		border-radius: 50%;
		background-color: var(--default-background);
		box-shadow: var(--shadow);
	}
</style>

{#if visible}
	<Clickable {onClick}>
		<div class="scroll-button" style="--size: {size}px; {top ? 'top: ' + top + ';' : ''} {bottom ? 'bottom: ' + bottom + ';' : ''} {left ? 'left: ' + left + ';' : ''} {right ? 'right: ' + right + ';' : ''}">
			<Icon img="img/caret-{direction ? 'up' : 'down'}.svg" alt={direction ? '˄' : '˅'} colorVariable="--default-foreground" size="32px" padding="0px" />
		</div>
	</Clickable>
{/if}
