<script lang="ts">
	interface Props {
		icon?: string;
		size?: string;
		ariaLabel?: string;
		class?: string;
	}

	const { icon = '⋮⋮', size = '20px', ariaLabel = 'Drag to reorder', class: className = '' }: Props = $props();
</script>

<style>
	.drag-handle {
		cursor: grab;
		padding: 0 5px;
		color: var(--primary-foreground);
		user-select: none;
		transition: color 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.drag-handle:hover {
		color: var(--primary);
	}

	.drag-handle:active {
		cursor: grabbing;
	}
</style>

<div class="drag-handle {className}" style="width: {size}; height: {size};" role="button" tabindex="0" aria-label={ariaLabel}>{icon}</div>
