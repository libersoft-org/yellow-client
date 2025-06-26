<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Indicator from '@/core/components/ModuleBar/ModuleBarIndicator.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import type { Writable } from 'svelte/store';
	interface Props {
		decl: {
			id: string;
			name: string;
		};
		clickSetModule: (id: string) => void;
		online: Writable<boolean>;
		selected?: boolean;
	}
	let { decl, clickSetModule, online, selected }: Props = $props();
</script>

<style>
	.item {
		z-index: 1;
		position: relative;
		border-radius: 10px;
		transform: scale(1);
		transition:
			transform 0.2s linear,
			background-color 0.4s linear;
	}

	.item:not(.selected):hover {
		z-index: 2;
		transform: scale(1.25);
	}

	.item.selected {
		background-color: var(--secondary-softer-background);
		transform: scale(1.25);
	}
</style>

<Clickable data-testid={'ModuleBarItem-' + decl.id} onClick={() => clickSetModule(decl.id)}>
	<div class="item" class:selected>
		<Indicator img="img/indicator-cross.svg" alt="X" enabled={$online === false} />
		<Icon img="img/modules/{decl.id}.svg" alt={decl.name} colorVariable="--primary-background" size="30px" />
	</div>
</Clickable>
