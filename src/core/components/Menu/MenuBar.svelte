<script lang="ts">
	import { product } from '@/core/scripts/stores.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import MenuBarDebug from '@/core/components/Menu/MenuBarDebug.svelte';
	interface Props {
		onOpenMenu: () => void;
	}
	let { onOpenMenu }: Props = $props();
</script>

<style>
	.bar {
		display: flex;
		align-items: center;
		height: var(--menu-height);
		min-height: var(--menu-height);
		background-color: var(--primary-background);
		color: var(--primary-foreground);
	}

	.product {
		font-size: 22px;
		font-weight: bold;
	}
</style>

<div class="bar">
	<Icon img="img/menu.svg" alt="☰" colorVariable="--primary-foreground" size="30px" padding="10px" onClick={onOpenMenu} testId="menu-button" />
	<div class="product">{product}</div>
	<MenuBarDebug />
</div>
