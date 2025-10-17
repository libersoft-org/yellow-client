<script lang="ts">
	import CornerSelectorCorner from '@/core/components/CornerSelector/CornerSelectorCorner.svelte';
	interface Props {
		value?: string;
		disabled?: boolean;
	}
	let { value = $bindable('top-right'), disabled = false }: Props = $props();

	function selectCorner(corner) {
		if (disabled) return;
		value = corner;
	}
</script>

<style>
	.disabled {
		opacity: 0.5;
	}

	.cornerselector {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.row {
		display: flex;
		gap: 5px;
	}
</style>

<div class="cornerselector {disabled ? 'disabled' : ''}">
	<div class="row">
		<CornerSelectorCorner active={value === 'top-left'} onClick={() => selectCorner('top-left')} />
		<CornerSelectorCorner active={value === 'top-right'} onClick={() => selectCorner('top-right')} />
	</div>
	<div class="row">
		<CornerSelectorCorner active={value === 'bottom-left'} onClick={() => selectCorner('bottom-left')} />
		<CornerSelectorCorner active={value === 'bottom-right'} onClick={() => selectCorner('bottom-right')} />
	</div>
</div>
