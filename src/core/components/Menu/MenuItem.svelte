<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		img?: string;
		title?: string;
		onClick?: (e: Event) => void;
		testId?: string;
	}
	let { img, title, onClick, testId }: Props = $props();
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

{#if img || title}
	<Clickable {onClick} data-testid={testId}>
		<div class="item">
			{#if img}
				<Icon {img} alt={title} colorVariable="--secondary-foreground" size="24px" padding="0px" />
			{/if}
			{#if title}
				<div>{title}</div>
			{/if}
		</div>
	</Clickable>
{/if}
