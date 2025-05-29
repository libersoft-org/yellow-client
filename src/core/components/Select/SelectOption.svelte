<script lang="ts">
	interface Props {
		value?: string;
		text?: string;
		selected?: boolean;
		disabled?: boolean;
	}

	let { value = '', text = '', selected = false, disabled = false }: Props = $props();
</script>

<option {value} {selected} {disabled}>{text}</option>

<style>
	option {
		cursor: pointer;
	}
</style>
