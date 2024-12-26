<script>
 import BaseButton from './base-button.svelte';
 import InputText from './input-text.svelte';
 export let options = [];
 export let selected = '';
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
  border: 1px solid #000;
  background-color: #fff;
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
  border: 1px solid #000;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
 }

 .selected .text {
  flex-grow: 1;
  padding: 0 10px;
 }

 .selected .clear {
  padding: 10px;
 }

 .selected .clear img {
  display: block;
  width: 10px;
  height: 10px;
 }
</style>

<div class="dropdown-filter">
 {#if selected}
  <div class="selected">
   <div class="text">{selected}</div>
   <BaseButton onClick={clickClearSelection}>
    <div class="clear">
     <img src="img/close-black.svg" alt="X" />
    </div>
   </BaseButton>
  </div>
 {:else}
  <InputText bind:value={inputValue} on:input={onInput} on:focus={toggleOptions} />
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
