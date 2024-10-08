<script>
 export let value = '';
 export let options = ['Možnost 1', 'Možnost 2', 'Možnost 3'];

 let filteredOptions;
 $: filteredOptions = options;
 $: console.log('filteredOptions:', filteredOptions);

 let showOptions = false;

 function filterOptions() {
  filteredOptions = options.filter(option => option.toLowerCase().includes(value.toLowerCase()));
 }

 function selectOption(v) {
  value = v;
  showOptions = false;
 }

 function toggleOptions() {
  showOptions = true;
 }

 function hideOptions() {
  setTimeout(() => {
   showOptions = false;
  }, 100);
 }
</script>

<span class="combo-box">
 <input type="text" bind:value on:input={filterOptions} on:focus={toggleOptions} on:blur={hideOptions} placeholder="Zadejte nebo vyberte" />
 {#if showOptions}
  <div class="options-container">
   {#each filteredOptions as option}
    <div class="option" on:click={() => selectOption(option)}>
     {option}
    </div>
   {/each}
  </div>
 {/if}
</span>

<style>
 .combo-box {
  position: relative;
  width: 200px;
 }

 .options-container {
  position: absolute;
  width: 100%;
  border: 1px solid #ccc;
  background: white;
  max-height: 150px;
  overflow-y: auto;
 }

 .option {
  padding: 8px;
  cursor: pointer;
 }

 .option:hover {
  background-color: #f1f1f1;
 }
</style>
