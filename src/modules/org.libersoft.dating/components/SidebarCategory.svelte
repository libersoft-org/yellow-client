<script>
	import SidebarItem from '@/core/components/Sidebar/SidebarItem.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { module } from '../module.js';
	export let img = null;
	export let label;
	export let active = false;
	export let onClick;
	export let colorVariable = '--primary-foreground';
</script>

<style>
	.sidebar-category {
		display: flex;
		gap: 10px;
	}
</style>

{#if label || img}
	<SidebarItem {onClick} {active}>
		<div class="sidebar-category">
			{#if img}
				<Icon img="modules/{module.identifier}/img/{img}" {colorVariable} alt={label} size="20px" padding="0px" />
			{/if}
			{#if label}
				<div>{label}</div>
			{/if}
		</div>
	</SidebarItem>
{/if}
