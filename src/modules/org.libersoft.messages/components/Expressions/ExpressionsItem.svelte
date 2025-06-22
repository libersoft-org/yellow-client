<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		icon?: string;
		label?: string;
		active?: boolean;
		colorVariable?: string;
		onClick?: (e: Event) => void;
	}
	let { icon, label, active, colorVariable = '--default-foreground', onClick }: Props = $props();

	function onMousedown(e) {
		e.stopPropagation();
		e.preventDefault();
	}
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		height: 100%;
		flex: 1;
		text-align: center;
		padding: 0 10px;
		color: var(--primary-foreground);
	}

	.item:hover {
		background-color: var(--primary-hard-background);
	}

	.item.active {
		font-weight: bold;
		background-color: var(--primary-harder-background);
	}

	.item .label {
		font-size: 14px;
	}
</style>

<Clickable {onClick} {onMousedown}>
	<div class="item {active ? 'active' : ''}">
		{#if icon}
			<Icon img={icon} alt={label} {colorVariable} size="24px" padding="0px" />
		{/if}
		{#if label}
			<div class="label">{label}</div>
		{/if}
	</div>
</Clickable>
