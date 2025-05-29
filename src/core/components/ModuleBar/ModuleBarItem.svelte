<script>
	import BaseButton from '../Button/BaseButton.svelte';
	import Indicator from './ModuleBarIndicator.svelte';
	import Icon from '../Icon/Icon.svelte';
	export let decl;
	export let clickSetModule;
	export let online;
	export let selected;
</script>

<BaseButton data-testid={'ModuleBarItem-' + decl.id} onClick={() => clickSetModule(decl.id)}>
	<div class="item {selected && 'selected'}">
		<Indicator img="img/indicator-cross.svg" alt="X" enabled={$online === false ? true : false} />
		<Icon img="img/modules/{decl.id}.svg" alt={decl.name} colorVariable="--color-primary-background" size="30px" />
	</div>
</BaseButton>

<style>
	.item {
		position: relative;
		z-index: 1;
		border-radius: 10px;
		transform: scale(1);
		transition:
			transform 0.2s linear,
			background-color 0.4s linear;

		&:not(.selected) {
			&:hover {
				transform: scale(1.25);
				z-index: 10;
			}
		}
	}

	.item.selected {
		background-color: var(--color-secondary-soft-background);
		transform: scale(1.25);
	}
</style>
