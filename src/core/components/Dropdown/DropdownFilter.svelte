<script>
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	export let options = [];
	export let selected = '';
	export let enabled = true;
	let filteredOptions = options;
	let showOptions = false;
	let inputValue = '';

	function onInput(event) {
		inputValue = event.target.value;
		filteredOptions = options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase()));
		showOptions = true;
	}

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
		max-width: 200px;
	}

	.options {
		position: absolute;
		border: 1px solid var(--default-foreground);
		background-color: var(--default-background);
		width: 100%;
		max-height: 150px;
		overflow-y: auto;
		z-index: 1;
		box-sizing: border-box;
	}

	.option {
		padding: 8px;
	}

	.option:hover {
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
		<Input bind:value={inputValue} {enabled} on:input={onInput} on:focus={toggleOptions} />
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
