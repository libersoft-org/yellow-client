<script>
	import BaseButton from '@/core/components/BaseButton/BaseButton.svelte';
	export let item = '';
	export let icon = '';
	export let className = '';
	export let onClick;
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		width: 100%;
	}

	.item img {
		width: 32px;
		height: 32px;
	}

	.item.even {
		background-color: var(--secondary-soft-background);
	}

	.item.odd {
		background-color: var(--primary-lighter-background);
	}

	.item:hover {
		background-color: var(--primary-background);
	}
</style>

<BaseButton {onClick}>
	<div class="item {className}">
		{#if icon}
			<div><img src={icon} alt={item} /></div>
		{/if}
		<div>{item}</div>
	</div>
</BaseButton>
