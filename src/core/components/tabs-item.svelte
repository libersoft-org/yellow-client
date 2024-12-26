<script>
 export let img;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  padding: 10px;
  color: #fff;
  cursor: pointer;
 }

 .item.active {
  font-weight: bold;
  background-color: #383838;
 }

 .item img {
  display: flex;
  width: 20px;
  height: 20px;
 }
</style>

<div class="item {active ? 'active' : ''}" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>
 {#if img}
  <div><img src={img} alt={label ? label : ''} /></div>
 {/if}
 {#if label}
  <div>{label}</div>
 {/if}
</div>
