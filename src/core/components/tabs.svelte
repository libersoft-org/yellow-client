<script>
 export let items = [];
 export let activeTabValue = 1;
 const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>

<style>
 :root {
  --border-color: #888;
 }

 .box {
  margin-bottom: 10px;
  padding: 40px;
  border: 1px solid var(--border-color);
  border-radius: 0 0 5px 5px;
  border-top: 0;
 }

 ul {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
  border-bottom: 1px solid var(--border-color);
 }

 li {
  margin-bottom: -1px;
 }

 span {
  border: 1px solid transparent;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  display: block;
  padding: 5px 10px;
  cursor: pointer;
 }

 span:hover {
  border-color: #e9ecef #e9ecef var(--border-color);
 }

 li.active > span {
  color: #495057;
  background-color: #fff;
  border-color: var(--border-color) var(--border-color) #fff;
 }
</style>

<ul>
 {#each items as item}
  <li class={activeTabValue === item.value ? 'active' : ''}>
   <span on:click={handleClick(item.value)}>{item.label}</span>
  </li>
 {/each}
</ul>
{#each items as item}
 {#if activeTabValue == item.value}
  <div class="box">
   <svelte:component this={item.component} />
  </div>
 {/if}
{/each}
