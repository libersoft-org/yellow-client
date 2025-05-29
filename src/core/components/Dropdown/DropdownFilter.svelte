<script>
  import BaseButton from '@/core/components/Button/BaseButton.svelte';
  import Input from '../Input/Input.svelte';
  import Icon from '../Icon/Icon.svelte';
  export let options = [];
  export let selected = '';
  let filteredOptions = options;
  let showOptions = false;
  let inputValue = '';

  function onInput(event) {
    inputValue = event.target.value;
    filteredOptions = options.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()));
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

<div class="dropdown-filter">
  {#if selected}
    <div class="selected">
      <div class="text">{selected}</div>
      <Icon
        img="img/close.svg"
        alt="X"
        colorVariable="--color-primary-foreground"
        size="10px"
        onClick={clickClearSelection}
      />
    </div>
  {:else}
    <Input bind:value={inputValue} on:input={onInput} on:focus={toggleOptions} />
    {#if showOptions}
      <div class="options">
        {#each filteredOptions as option}
          <BaseButton onClick={() => clickSelectOption(option)}>
            <div class="option">{option}</div>
          </BaseButton>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .dropdown-filter {
    position: relative;
    max-width: 200px;
  }
  /*
 input {
  width: 100%;
  padding: 5px;
  font-family: inherit;
  font-size: inherit;
  border: 1px solid #000;
  border-radius: 10px;
  box-sizing: border-box;
 }
*/
  .options {
    position: absolute;
    border: 1px solid var(--color-primary-foreground);
    background-color: var(--color-primary-background);
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
    background-color: #eee;
  }

  .selected {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-primary-background);
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .selected .text {
    flex-grow: 1;
    padding: 0 10px;
  }
</style>
