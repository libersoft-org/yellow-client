<script lang="ts">
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'color';
		placeholder?: string;
		value?: string | number;
		enabled?: boolean;
		displayValue?: string | number;
		expand?: boolean;
		minWidth?: string;
		maxWidth?: string;
		onKeydown?: (e: KeyboardEvent) => void;
		min?: number;
		max?: number;
		step?: number;
		icon?: {
			img: string;
			alt: string;
			onClick?: (e: Event) => void;
			colorVariable?: string;
		};
		inputRef?: HTMLInputElement; // TODO: is it really prop?
		'data-testid'?: string;
		onChange?: (value: string | number) => void;
	}
	let { type = 'text', placeholder = '', value = $bindable(), enabled = true, displayValue = undefined, expand = true, minWidth = undefined, maxWidth = undefined, onKeydown = undefined, min = undefined, max = undefined, step = undefined, icon = undefined, inputRef = $bindable(), 'data-testid': testId = undefined, onChange = undefined }: Props = $props();

	function handleKeydown(e) {
		if (onKeydown) onKeydown(e);
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		setValue(target.value);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		setValue(target.value);
	}

	function setValue(newValue: string | number) {
		value = type === 'number' ? Number(newValue) : newValue;
		onChange?.(value);
	}

	export function focus() {
		inputRef?.focus();
	}
</script>

<style>
	input {
		box-sizing: border-box;
		padding: 10px;
		border-radius: 10px;
		font-family: inherit;
		font-size: inherit;
		background-color: var(--default-background);
		color: var(--default-foreground);
	}

	.no-button {
		border: 1px solid var(--default-foreground);
	}

	.button {
		width: 100%;
		border: 0;
		outline: none;
	}

	input:focus {
		outline: 2px solid var(--primary-harder-background);
	}

	input:disabled {
		border: 1px solid var(--disabled-foreground);
		background-color: var(--disabled-background);
		color: var(--disabled-foreground);
	}

	input.expand {
		width: 100%;
	}

	.input-button-wrapper {
		display: flex;
		box-sizing: border-box;
		align-items: center;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		background-color: var(--default-background);
	}
</style>

{#if icon}
	<div class="input-button-wrapper" style:max-width={maxWidth && maxWidth} style:min-width={minWidth && minWidth}>
		<input class="button" class:expand {type} {placeholder} bind:this={inputRef} bind:value onkeydown={e => handleKeydown(e)} oninput={handleInput} />
		<Icon img={icon.img} alt={icon.alt} colorVariable={icon.colorVariable ? icon.colorVariable : ''} size="20px" padding="10px" onClick={icon.onClick} />
	</div>
{:else}
	<input class="no-button" data-testid={testId} value={displayValue !== undefined ? displayValue : value} disabled={!enabled} onchange={handleChange} oninput={handleInput} class:expand style:max-width={maxWidth && maxWidth} style:min-width={minWidth && minWidth} {type} {placeholder} {min} {max} {step} bind:this={inputRef} onkeydown={e => handleKeydown(e)} />
{/if}
