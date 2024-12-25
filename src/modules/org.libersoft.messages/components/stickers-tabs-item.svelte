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
  flex: 1;
  font-size: 14px;
  padding: 10px;
  color: #fff;
  cursor: pointer;
  text-align: center;
 }

 .item.active {
  font-weight: bold;
  background-color: #383838;
 }
</style>

<div class="item {active ? 'active' : ''}" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>{label}</div>
