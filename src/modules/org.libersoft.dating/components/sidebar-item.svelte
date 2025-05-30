<script>
	import { module } from '../module.js';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let img = null;
	export let label = '';
	export let onClick;
	export let colorVariable = '--default-foreground';
</script>

<style>
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 30px;
		padding: 10px;
		background-color: #fffcf0;
		border-bottom: 1px solid #dd9;
		width: 100%;
	}
</style>

<BaseButton {onClick} width="100%">
	<div class="item">
		{#if img}
			<Icon img="modules/{module.identifier}/img/{img}" alt={label} {colorVariable} size="20px" padding="0px" />
		{/if}
		<div>{label}</div>
	</div>
</BaseButton>
