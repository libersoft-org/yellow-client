<script lang="ts">
	import BaseButton from '../BaseButton/BaseButton.svelte';
	interface Props {
		even?: boolean;
		active?: boolean;
		onClick?: (e: Event) => void;
	}
	let { even = false, active = false, onClick }: Props = $props();

	function handleClick(e) {
		console.log('SidebarItem clicked');
		if (onClick) onClick(e);
	}
</script>

<style>
	.item {
		display: flex;
		flex-direction: column;
		padding: 10px;
		border-bottom: 1px solid var(--primary-background);
		color: var(--primary-foreground);
		cursor: pointer;
		transition: background-color 0.4s linear;
	}

	.item.even {
		background-color: var(--primary-softer-background);
	}

	.item.odd {
		background-color: var(--primary-soft-background);
	}

	.item:hover {
		background-color: var(--primary-background);
	}

	.item.active {
		background-color: var(--primary-hard-background);
		transition: background-color 0.4s linear;
	}
</style>

<BaseButton onClick={handleClick}>
	<div class="item {even ? 'even' : 'odd'} {active && 'active'}">
		<slot />
	</div>
</BaseButton>
