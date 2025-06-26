<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		content: string;
		onClick: (e: Event) => void;
	}
	let { content, onClick }: Props = $props();
</script>

<style>
	.photo-card-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px;
		border: 1px solid var(--primary-background);
		border-radius: 50%;
		box-shadow: var(--shadow);
	}
</style>

<Clickable {onClick}>
	<div class="photo-card-button">{content}</div>
</Clickable>
