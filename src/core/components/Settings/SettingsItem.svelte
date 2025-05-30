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
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
		border: 1px solid var(--secondary-background);
		border-radius: 10px;
		padding: 20px;
		gap: 20px;
	}

	.item:hover {
		background-color: var(--primary-softer-background);
	}
</style>

<BaseButton {onClick} width="100%" align="center">
	<div class="item">
		{#if img}
			<Icon {img} alt={title} colorVariable="--primary-foreground" size="24px" padding="0px" />
		{/if}
		{#if title}
			<div>{title}</div>
		{/if}
	</div>
</BaseButton>
