<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let img;
	export let title;
	export let onClick;
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		width: 100%;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
		border: 1px solid var(--secondary-background);
		border-radius: 10px;
		padding: 20px;
		gap: 20px;
		transition: background-color 0.4s linear;
	}

	.item:hover {
		background-color: var(--primary-background);
	}
</style>

<Clickable {onClick}>
	<div class="item">
		{#if img}
			<Icon {img} alt={title} colorVariable="--primary-foreground" size="24px" padding="0px" />
		{/if}
		{#if title}
			<div>{title}</div>
		{/if}
	</div>
</Clickable>
