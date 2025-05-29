<script lang="ts">
	import Icon from '../Icon/Icon.svelte';
	import MenuBarDebug from './MenuBarDebug.svelte';
	import { product } from '../../core.js';

	type Props = {
		onOpenMenu: () => void;
	};

	let { onOpenMenu }: Props = $props();
</script>

<style>
	.bar {
		display: flex;
		align-items: center;
		height: var(--menu-height);
		min-height: var(--menu-height);
		background-color: var(--color-primary-background);
		color: var(--color-primary-foreground);
	}

	.product {
		font-size: 22px;
		font-weight: bold;
	}
</style>

<div class="bar">
	<Icon img="img/menu.svg" alt="☰" colorVariable="--color-primary-foreground" size="30px" padding="10px" onClick={onOpenMenu} />
	<div class="product">{product}</div>
	<MenuBarDebug />
</div>
