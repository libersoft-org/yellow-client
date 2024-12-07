<script>
 export let img;
 export let alt = '';
 export let hiddenOnDesktop = false;
 export let onClick;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick && onClick();
  }
 }
</script>

<style>
 .button {
  display: flex;
  cursor: pointer;
 }

 .button img {
  width: 32px;
  height: 32px;
 }

 @media (min-width: 769px) {
  .button.hidden {
   display: none;
  }
 }
</style>

{#if img}
 <div class="button {hiddenOnDesktop ? 'hidden' : ''}" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>
  <img src={img} {alt} />
 </div>
{/if}
