<script lang="ts">
	import SidebarItem from '@/core/components/Sidebar/SidebarItem.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { module } from '../module.ts';
	interface Props {
		img?: string;
		label?: string;
		active?: boolean;
		onClick?: (e: Event) => void;
		colorVariable?: string;
	}
	let { img, label, active = false, onClick, colorVariable = '--primary-foreground' }: Props = $props();
</script>

<style>
	.sidebar-category {
		display: flex;
		gap: 10px;
	}

	.title {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

{#if label || img}
	<SidebarItem {onClick} {active}>
		<div class="sidebar-category">
			{#if img}
				<Icon img="modules/{module.identifier}/img/{img}" {colorVariable} alt={label} size="20px" padding="0px" />
			{/if}
			{#if label}
				<div class="title">{label}</div>
			{/if}
		</div>
	</SidebarItem>
{/if}
