<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let img;
	export let label;
	export let active;
	export let colorVariable = '--secondary-foreground';
	export let onClick;
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1; /* TODO: this is not working as it needs to be applied on Clickable, not on .item. If applied to Clickable, it spoils everything that doesn't need it. */
		font-size: 16px;
		padding: 10px;
	}

	.item.active {
		font-weight: bold;
		background-color: var(--secondary-softer-background);
	}

	.item:hover {
		background-color: var(--secondary-soft-background);
	}
</style>

<Clickable {onClick}>
	<div class="item {active && 'active'}">
		{#if img}
			<Icon {img} alt={label ? label : ''} {colorVariable} size="20px" padding="0px" />
		{/if}
		{#if label}
			<div>{label}</div>
		{/if}
	</div>
</Clickable>
