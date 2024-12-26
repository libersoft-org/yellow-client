<script>
 export let onClick;
 export let title = '';
 export let enabled = true;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick();
  }
 }
</script>

<div role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>
 <slot />
</div>
