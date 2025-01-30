<script>
 export let onClick;
 export let onRightClick;
 export let onMousedown;

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
  display: contents;
 }
</style>

<div class="base-button" role="button" tabindex="0" on:click={onClick} on:mousedown={onMousedown} on:keydown={handleKeydown} on:contextmenu={onRightClick}>
 <slot />
</div>
