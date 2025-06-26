<script lang="ts">
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	interface Props {
		items: Array<{
			title: string;
			onClick: (e: Event) => void;
		}>;
	}
	let { items }: Props = $props();
	let firstItemColor = $derived(items.length === 1 ? '--secondary-foreground' : '--disabled-foreground');
</script>

<style>
	.breadcrumb {
		display: flex;
		flex-wrap: wrap;
		padding: 10px;
		border-radius: 10px;
		font-weight: bold;
		background: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.item {
		display: flex;
		gap: 5px;
	}

	:global(.breadcrumb > *:not(:first-child))::before {
		content: '>';
		margin: 0 5px;
		color: var(--disabled-foreground);
	}

	:global(.breadcrumb > *:not(:last-child) .item) {
		color: var(--disabled-foreground);
	}

	:global(.breadcrumb > *:last-child .item) {
		color: var(--secondary-foreground);
	}

	:global(.breadcrumb .item-wrapper) {
		display: flex;
		flex-wrap: wrap;
	}
</style>

{#if items}
	<div class="breadcrumb">
		{#each items as item, index}
			<Clickable class="item-wrapper" onClick={item.onClick} data-testid={`breadcrumb-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
				<div class="item">
					{#if index === 0}
						<Icon padding="0" img="img/home.svg" alt="Settings" size="16px" colorVariable={firstItemColor} />
					{/if}
					<div>{item.title}</div>
				</div>
			</Clickable>
		{/each}
	</div>
{/if}
