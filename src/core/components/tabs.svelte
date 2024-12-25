<script>
 export let items = [];
 export let activeTabValue = 1;

 function handleClick(tabValue) {
  activeTabValue = tabValue;
 }

 function handleKeydown(event, tabValue) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   console.log(event);
   handleClick(tabValue);
  }
 }
</script>

<style>
 :root {
  --border-color: #888;
 }

 .box {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 0 0 5px 5px;
  border-top: 0;
 }

 .tab-container {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-color);
 }

 .tab {
  display: block;
  padding: 5px 10px;
  margin-bottom: -1px;
  border: 1px solid transparent;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  color: var(--border-color);
  cursor: pointer;
 }

 .tab:hover {
  border-color: #ccc #ccc #ccc;
 }

 .tab.active {
  color: #000;
  background-color: #fff;
  border-color: var(--border-color) var(--border-color) #fff;
 }
</style>

<div class="tab-container">
 {#each items as item}
  <div class={'tab ' + (activeTabValue === item.value ? 'active' : '')} role="button" tabindex="0" on:click={handleClick(item.value)} on:keydown={event => handleKeydown(event, item.value)}>
   {item.label}
  </div>
 {/each}
</div>
{#each items as item}
 {#if activeTabValue == item.value}
  <div class="box">
   <svelte:component this={item.component} />
  </div>
 {/if}
{/each}
