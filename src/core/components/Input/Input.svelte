<script lang="ts">
	import Icon from '@/core/components/Icon/Icon.svelte';
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
		icon?: {
			img: string;
			alt: string;
			onClick?: (e: Event) => void;
			colorVariable?: string;
		};
		inputRef?: HTMLInputElement; // TODO: is it really prop?
		'data-testid'?: string;
	}
	let { type = 'text', placeholder = '', value = $bindable(), enabled = true, displayValue = undefined, grow = false, minWidth = undefined, maxWidth = undefined, onKeydown = undefined, min = undefined, max = undefined, step = undefined, icon = undefined, inputRef = $bindable(), 'data-testid': testId = undefined }: Props = $props();

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
		padding: 10px;
		border-radius: 10px;
		font-family: inherit;
		font-size: inherit;
		background-color: var(--default-background);
		color: var(--default-foreground);
		box-sizing: content-box;
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

	.input-button-wrapper {
		display: flex;
		box-sizing: content-box;
		align-items: center;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		background-color: var(--default-background);
	}
</style>

{#if icon}
	<div class="input-button-wrapper" style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'}>
		<input class="button" {type} {placeholder} bind:this={inputRef} bind:value onkeydown={e => handleKeydown(e)} />
		<Icon img={icon.img} alt={icon.alt} colorVariable={icon.colorVariable ? icon.colorVariable : ''} size="20px" padding="10px" onClick={icon.onClick} />
	</div>
{:else}
	<input class="no-button" data-testid={testId} value={displayValue !== undefined ? displayValue : value} disabled={!enabled} onchange={handleChange} style:flex-grow={grow ? '1' : undefined} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'} {type} {placeholder} {min} {max} {step} bind:this={inputRef} onkeydown={e => handleKeydown(e)} />
{/if}
