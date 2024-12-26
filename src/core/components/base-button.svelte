<script>
 export let onClick;
 export let title = '';

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick();
  }
 }
</script>

<div class="button {!enabled ? 'disabled' : ''} {hiddenOnDesktop ? 'hidden-on-desktop' : ''}" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>
 <slot />
</div>
