<script>
 export let img;
 export let title = '';
 export let click;

 function handleKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   click();
  }
 }
</script>

<style>
 .accounts-button {
  display: flex;
  gap: 10px;
  padding: 10px;
 }

 .accounts-button img {
  width: 20px;
  height: 20px;
 }

 .accounts-button:hover {
  background-color: #222;
 }
</style>

<div class="accounts-button" role="button" tabindex="0" on:click={click} on:keydown={handleKey}>
 {#if img}
  <div><img src={img} alt={title} /></div>
 {/if}
 <div>{title}</div>
</div>
