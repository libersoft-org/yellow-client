<script>
	import BaseButton from '../Button/BaseButton.svelte';
	import Icon from '../Icon/Icon.svelte';
	export let img;
	export let title;
	export let onClick;
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		width: 100%;
		color: var(--secondary-foreground);
		border-bottom: 1px solid var(--secondary-softer-background);
		gap: 20px;
		padding: 15px 20px;
	}

	.item:hover {
		background-color: var(--secondary-softer-background);
	}
</style>

<BaseButton {onClick} align="center">
	<div class="item">
		{#if img}
			<Icon {img} alt={title} colorVariable="--secondary-foreground" size="24px" padding="0px" />
		{/if}
		{#if title}
			<div>{title}</div>
		{/if}
	</div>
</BaseButton>
