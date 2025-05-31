<script>
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let type = 'text';
	export let placeholder = '';
	export let value = '';
	export let img;
	export let alt = '';
	export let onClick;
	export let grow = false;
	export let minWidth;
	export let maxWidth;
	export let onKeydown;
	export let colorVariable = '--secondary-background';
	let elInput;

	function handleKeydown(e) {
		if (onKeydown) onKeydown(e);
	}

	export function focus() {
		elInput?.focus();
	}
</script>

<style>
	.input-button {
		display: flex;
		box-sizing: content-box;
		align-items: center;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		background-color: var(--default-background);
	}

	input {
		width: 100%;
		border: 0;
		border-radius: 10px;
		padding: 10px;
		font-family: inherit;
		font-size: inherit;
		background-color: var(--default-background);
		color: var(--default-foreground);
		outline: none;
	}

	input:focus {
		outline: 2px solid var(--primary-harder-background);
	}
</style>

<div class="input-button" style:flex-grow={grow && '1'} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'}>
	<input {type} {placeholder} bind:this={elInput} bind:value on:keydown={e => handleKeydown(e)} />
	<Icon {img} {alt} colorVariable={colorVariable && colorVariable} size="20px" padding="10px" {onClick} />
</div>
