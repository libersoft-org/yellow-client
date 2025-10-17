<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		visible?: boolean;
		direction?: boolean;
		left?: string;
		right?: string;
		top?: string;
		bottom?: string;
		onClick?: (e: Event) => void;
	}
	let { visible = true, direction = false, left, right, top, bottom, onClick }: Props = $props();
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
