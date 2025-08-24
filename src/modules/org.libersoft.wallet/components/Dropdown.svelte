<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		text?: string;
		colorVariable?: string;
		onClick?: (e: Event) => void;
		'data-testid'?: string;
	}
	let { text, colorVariable = '--secondary-foreground', onClick, 'data-testid': testId }: Props = $props();
</script>

<style>
	.dropdown {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 5px;
		padding: 5px 10px;
		white-space: nowrap;
		border: 0;
		border-radius: 10px;
		font-family: inherit;
		box-sizing: border-box;
		width: 100%;
		background-color: var(--secondary-softer-background);
		color: var(--secondary-foreground);
	}

	.dropdown .text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
		/* No max-width on mobile - let it take full available width */
	}

	/* Apply max-width only on tablet and desktop (768px and above) */
	@media (min-width: 768px) {
		.dropdown .text {
			max-width: 200px;
		}
	}

	/* Ensure the dropdown can shrink properly */
	.dropdown {
		min-width: 0;
		flex-shrink: 1;
	}
</style>

<Clickable {onClick} data-testid={testId}>
	<div class="dropdown">
		<div class="text">{text}</div>
		<Icon img="img/down.svg" alt="▼" size="15px" padding="0px" colorVariable={colorVariable && colorVariable} />
	</div>
</Clickable>
