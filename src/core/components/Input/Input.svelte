<script lang="ts">
	interface Props {
		type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'color';
		placeholder?: string;
		value?: string | number;
		enabled?: boolean;
		displayValue?: string | number;
		grow?: boolean;
		minWidth?: string;
		maxWidth?: string;
		onKeydown?: (e: KeyboardEvent) => void;
		min?: number;
		max?: number;
		step?: number;
		inputRef?: HTMLInputElement;
		'data-testid'?: string;
	}
	let { type = 'text', placeholder = '', value = $bindable(), enabled = true, displayValue = undefined, inputRef = $bindable(), grow = false, minWidth = undefined, maxWidth = undefined, onKeydown = undefined, min = undefined, max = undefined, step = undefined, 'data-testid': testId = undefined }: Props = $props();

	function handleKeydown(e) {
		if (onKeydown) onKeydown(e);
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value = type === 'number' ? Number(target.value) : target.value;
	}

	export function focus() {
		inputRef?.focus();
	}
</script>

<style>
	input {
		box-sizing: content-box;
		padding: 10px;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		font-family: inherit;
		font-size: inherit;
		background-color: var(--default-background);
		color: var(--default-foreground);
	}

	input:focus {
		outline: 2px solid var(--primary-harder-background);
	}

	input:disabled {
		border: 1px solid var(--disabled-foreground);
		background-color: var(--disabled-background);
		color: var(--disabled-foreground);
	}
</style>

<input data-testid={testId} value={displayValue !== undefined ? displayValue : value} disabled={!enabled} onchange={handleChange} style:flex-grow={grow ? '1' : undefined} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'} {type} {placeholder} {min} {max} {step} bind:this={inputRef} onkeydown={e => handleKeydown(e)} />
