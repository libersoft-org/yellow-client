<script>
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

 function keySelectOption(option, event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickSelectOption(option);
  }
 }

 function clickClearSelection() {
  selected = '';
  inputValue = '';
  filteredOptions = options;
 }

 function keyClearSelection(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickClearSelection();
  }
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

 input {
  width: 100%;
  padding: 5px;
  font-family: inherit;
  font-size: inherit;
  border: 1px solid #000;
  border-radius: 10px;
  box-sizing: border-box;
 }

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
  cursor: pointer;
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
  cursor: pointer;
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
   <div class="clear" role="button" tabindex="0" on:click={clickClearSelection} on:keydown={keyClearSelection}>
    <img src="img/close-black.svg" alt="X" />
   </div>
  </div>
 {:else}
  <input type="text" bind:value={inputValue} on:input={onInput} on:focus={toggleOptions} />
  {#if showOptions}
   <div class="options">
    {#each filteredOptions as option}
     <div class="option" role="button" tabindex="0" on:click={() => clickSelectOption(option)} on:keydown={event => keySelectOption(option, event)}>{option}</div>
    {/each}
   </div>
  {/if}
 {/if}
</div>
