<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		img?: string;
		label?: string;
		active?: boolean;
		colorVariable?: string;
		onClick?: (e: Event) => void;
		testId?: string;
	}
	let { img, label, active, colorVariable = '--secondary-foreground', onClick, testId }: Props = $props();
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 10px;
		width: 100%;
	}

	.item.active {
		font-weight: bold;
		background-color: var(--secondary-softer-background);
	}

	.item:hover,
	:global(.clickable:focus-visible) .item,
	:global(.clickable.focused) .item {
		background-color: var(--secondary-soft-background);
	}
</style>

<Clickable {onClick} data-testid={testId} expand>
	<div class="item {active && 'active'}">
		{#if img}
			<Icon {img} alt={label ? label : ''} {colorVariable} size="20px" padding="0px" />
		{/if}
		{#if label}
			<div>{label}</div>
		{/if}
	</div>
</Clickable>
