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

 function mousedown(e) {
  e.stopPropagation();
  e.preventDefault();
 }
</script>

<style>
 .item {
  flex-grow: 1;
  text-align: center;
  cursor: pointer;
  padding: 10px 0;
 }

 .item.active {
  color: #000;
  font-weight: bold;
  text-decoration: underline;
 }
</style>

{#if label}
 <div class="item {active ? 'active' : ''}" role="button" tabindex="0" on:mousedown={mousedown} on:click={onClick} on:keydown={handleKeydown}>{label}</div>
{/if}
