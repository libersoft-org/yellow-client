<script lang="ts">
	interface Props {
		value?: string | number;
		text?: string;
		selected?: boolean;
		disabled?: boolean;
	}

	let { value = '', text = '', selected = false, disabled = false }: Props = $props();
</script>

<style>
	option {
		cursor: pointer;
	}
</style>

<option {value} {selected} {disabled}>{text}</option>
