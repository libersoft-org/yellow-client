<script lang="ts">
	interface Props {
		min?: number | string;
		max?: number | string;
		step?: number | string;
		value?: number | string;
		onchange?: (event: Event) => void;
	}
	let { min, max, step, value = $bindable(), onchange, ...restProps }: Props = $props();
</script>

<style>
	input[type='range'] {
		width: 100%;
		accent-color: var(--primary-background);
	}
</style>

<input type="range" {min} {max} {step} bind:value {...restProps} />
