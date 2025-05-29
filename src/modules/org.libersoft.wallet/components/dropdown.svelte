<script>
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let text;
	export let colorVariable;
	export let onClick;
</script>

<style>
	.dropdown {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px;
		border: 0;
		border-radius: 10px;
		font-family: inherit;
		width: 100%;
		background-color: var(--color-secondary-soft-background);
	}

	.dropdown .text {
		flex-grow: 1;
		color: black;
	}
</style>

<BaseButton {onClick}>
	<div class="dropdown">
		<div class="text">{text}</div>
		<Icon img="img/down.svg" alt="▼" size="15px" padding="0px" colorVariable={colorVariable && colorVariable} />
	</div>
</BaseButton>
