<script>
	import { module } from '../module.js';
	import SidebarItem from '@/core/components/SidebarItem/SidebarItem.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let img = null;
	export let label;
	export let active = false;
	export let onClick;
	export let colorVariable = '--default-foreground';
</script>

<style>
	.item {
		display: flex;
		gap: 10px;
	}
</style>

{#if label || img}
	<SidebarItem {onClick} {active}>
		<div class="item">
			{#if img}
				<Icon img="modules/{module.identifier}/img/{img}" {colorVariable} alt={label} size="20px" padding="0px" />
			{/if}
			{#if label}
				<div>{label}</div>
			{/if}
		</div>
	</SidebarItem>
{/if}
