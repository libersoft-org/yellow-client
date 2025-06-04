<script lang="ts">
	import Clickable from '../Clickable/Clickable.svelte';
	interface Props {
		img?: string;
		text?: string;
		enabled?: boolean;
		visibleOnMobile?: boolean;
		visibleOnDesktop?: boolean;
		colorVariable?: string;
		onClick?: (e: Event) => void;
	}
	let { img, text, enabled = true, visibleOnMobile = true, visibleOnDesktop = true, colorVariable, onClick, ...restProps }: Props = $props();

	function handleClick(e) {
		console.log('SidebarButton clicked');
		if (onClick) onClick(e);
	}
</script>

<style>
	.sidebar-button {
		display: flex;
		flex-direction: column;
		padding: 10px;
		border-bottom: 1px solid var(--secondary-background);
		color: var(--secondary-foreground);
		cursor: pointer;
		transition: background-color 0.4s linear;
	}

	.sidebar-button:hover {
		background-color: var(--secondary-soft-background);
	}

	.sidebar-button.active {
		background-color: var(--primary-hard-background);
		transition: background-color 0.4s linear;
	}
</style>

{#if img || text}
	<Clickable {...restProps} onClick={handleClick}>
		<div class="sidebar-button">
			{#if img}
				<Icon {img} colorVariable={!enabled ? '--disabled-foreground' : colorVariable} alt={text} size={iconSize} padding={iconPadding} />
			{/if}
			{#if text}
				<div>{text}</div>
			{/if}
		</div>
	</Clickable>
{/if}
