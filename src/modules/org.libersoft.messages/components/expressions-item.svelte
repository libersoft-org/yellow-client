<script>
 export let label;
 export let active;
 export let onClick;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick && onClick();
  }
 }
</script>

<style>
 .item {
  flex-grow: 1;
  text-align: center;
  cursor: pointer;
 }

 .item.active {
  color: #000;
  font-weight: bold;
  text-decoration: underline;
 }
</style>

{#if label}
 <div class="item {active ? 'active' : ''}" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>{label}</div>
{/if}
