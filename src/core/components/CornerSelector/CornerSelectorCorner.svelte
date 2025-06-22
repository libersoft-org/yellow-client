<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		active?: boolean;
		onClick?: (e: Event) => void;
	}
	let { active = false, onClick }: Props = $props();
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
