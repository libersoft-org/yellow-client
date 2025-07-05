<script lang="ts">
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		options?: string[];
		selected?: string;
		enabled?: boolean;
	}
	let { options = [], selected = $bindable(''), enabled = true }: Props = $props();
	let filteredOptions = $state(options);
	let showOptions = $state(false);
	let inputValue = $state('');

	$effect(() => {
		filteredOptions = options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase()));
		if (inputValue) {
			showOptions = true;
		}
	});

	function clickSelectOption(option) {
		selected = option;
		inputValue = option;
		showOptions = false;
	}

	function clickClearSelection() {
		selected = '';
		inputValue = '';
		filteredOptions = options;
	}

	function toggleOptions() {
		if (!selected) showOptions = true;
	}
</script>

<style>
	.dropdown-filter {
		position: relative;
		background-color: var(--default-background);
		color: var(--default-foreground);
	}

	.options {
		z-index: 1;
		position: absolute;
		border: 1px solid var(--default-foreground);
		background-color: var(--default-background);
		box-sizing: border-box;
		width: 100%;
		max-height: 150px;
		overflow-y: auto;
	}

	.option {
		padding: 8px;
	}

	.option:hover,
	:global(.clickable:focus-visible) .option,
	:global(.clickable.focused) .option {
		background-color: var(--default-background);
	}

	.selected {
		display: flex;
		align-items: center;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		width: 100%;
		box-sizing: border-box;
	}

	.selected .text {
		flex-grow: 1;
		padding: 0 10px;
	}
</style>

<div class="dropdown-filter">
	{#if selected}
		<div class="selected">
			<div class="text">{selected}</div>
			<Icon img="img/cross.svg" alt="X" colorVariable="--primary-foreground" size="10px" onClick={clickClearSelection} />
		</div>
	{:else}
		<div onfocus={toggleOptions}>
			<Input bind:value={inputValue} {enabled} />
		</div>
		{#if showOptions}
			<div class="options">
				{#each filteredOptions as option}
					<Clickable onClick={() => clickSelectOption(option)}>
						<div class="option">{option}</div>
					</Clickable>
				{/each}
			</div>
		{/if}
	{/if}
</div>
