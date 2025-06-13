<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	export let active = false;
	export let onClick;
</script>

<style>
	.corner {
		background-color: var(--disabled-background);
		border-radius: 5px;
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.corner:hover {
		background-color: var(--disabled-foreground);
	}

	.corner.active {
		background-color: var(--primary-background);
		cursor: default;
	}
</style>

<Clickable {onClick}>
	<div class="corner {active && 'active'}"></div>
</Clickable>
