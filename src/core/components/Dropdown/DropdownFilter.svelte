<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		placeholder?: string;
		options?: string[];
		selected?: string;
		enabled?: boolean;
	}
	let { placeholder, options = [], selected = $bindable(''), enabled = true }: Props = $props();
	let filteredOptions = $derived(options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase())));
	let showOptions = $state(false);
	let inputRef: Input | undefined = $state();
	let inputValue = $state('');
	let selectedIndex = $state(-1);

	export function focus() {
		inputRef?.focus();
	}

	function handleInputChange() {
		showOptions = true;
		selectedIndex = -1;
	}

	function clickSelectOption(option) {
		selected = option;
		inputValue = option;
		showOptions = false;
	}

	function clickClearSelection() {
		selected = '';
		inputValue = '';
		inputRef?.focus();
	}

	function toggleOptions() {
		if (!selected) openOptionsIfClosed();
	}

	function handleInputBlur() {
		closeOptions();
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!openOptionsIfClosed()) selectedIndex = selectedIndex < filteredOptions.length - 1 ? selectedIndex + 1 : 0;
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!openOptionsIfClosed()) selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredOptions.length - 1;
				break;
			case 'Enter':
				e.preventDefault();
				e.stopPropagation();
				if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) clickSelectOption(filteredOptions[selectedIndex]);
				break;
			case 'Escape':
				e.preventDefault();
				e.stopPropagation();
				closeOptions();
				break;
		}
	}

	function handleMouseEnter(index: number) {
		selectedIndex = index;
	}

	function openOptionsIfClosed() {
		if (!showOptions) {
			showOptions = true;
			selectedIndex = -1;
			return true;
		}
		return false;
	}

	function closeOptions() {
		showOptions = false;
		selectedIndex = -1;
	}
</script>

<style>
	.dropdown-filter {
		position: relative;
		background-color: var(--default-background);
		color: var(--default-foreground);
	}

	.input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.clear-button {
		z-index: 2;
		position: absolute;
		right: 0;
	}

	.options {
		z-index: 1;
		position: absolute;
		border-radius: 10px;
		border: 1px solid var(--default-foreground);
		background-color: var(--default-background);
		box-sizing: border-box;
		width: 100%;
		max-height: 150px;
		overflow-y: auto;
	}

	.option {
		padding: 10px;
	}

	:global(.clickable:nth-child(odd)) .option {
		background-color: var(--primary-softer-background);
	}

	:global(.clickable:nth-child(even)) .option {
		background-color: var(--primary-soft-background);
	}

	.option.highlighted {
		background-color: var(--primary-background) !important;
	}

	:global(.clickable:focus-visible) .option,
	:global(.clickable.focused) .option {
		background-color: var(--primary-background) !important;
	}
</style>

<div class="dropdown-filter">
	<div class="input-container">
		<Input {placeholder} bind:value={inputValue} bind:this={inputRef} {enabled} onChange={handleInputChange} onBlur={handleInputBlur} onFocus={toggleOptions} onKeydown={handleKeydown} onClick={toggleOptions} />
		{#if selected}
			<div class="clear-button">
				<Icon img="img/cross.svg" alt="X" colorVariable="--primary-foreground" size="14px" onClick={clickClearSelection} />
			</div>
		{/if}
	</div>
	{#if $debug}
		<div>Input Value: {inputValue}</div>
		<div>Selected Option: {selected}</div>
		<div>Selected Index: {selectedIndex}</div>
		<div>Filtered Options: {JSON.stringify(filteredOptions)}</div>
	{/if}
	{#if showOptions}
		<div class="options" onmousedown={e => e.preventDefault()} role="listbox" aria-label="Options" tabindex="-1">
			{#each filteredOptions as option, index}
				<Clickable onClick={() => clickSelectOption(option)}>
					<div class="option" class:highlighted={index === selectedIndex} onmouseenter={() => handleMouseEnter(index)} role="option" aria-selected={index === selectedIndex} tabindex="-1">{option}</div>
				</Clickable>
			{/each}
		</div>
	{/if}
</div>
