<script>
 export let onClick;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick();
  }
 }
</script>

<style>
 .base-button {
  cursor: pointer;
 }
</style>

<div class="base-button" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>
 <slot />
</div>
