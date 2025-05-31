<script>
	import BaseButton from '@/core/components/BaseButton/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let img;
	export let label;
	export let active;
	export let colorVariable = '--default-background';
	export let onClick;
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		flex: 1; /* TODO: this is not working as it needs to be applied on BaseButton, not on .item. If applied to BaseButton, it spoils everything that doesn't need it.*/
		padding: 10px;
		color: var(--secondary-foreground);
		width: 100%;
	}

	.item.active {
		font-weight: bold;
		background-color: var(secondary-foreground);
	}

	.item:hover {
		background-color: var(secondary-softer-foreground);
	}
</style>

<BaseButton {onClick}>
	<div class="item {active ? 'active' : ''}">
		{#if img}
			<Icon {img} alt={label ? label : ''} {colorVariable} size="20px" padding="0px" />
		{/if}
		{#if label}
			<div>{label}</div>
		{/if}
	</div>
</BaseButton>
