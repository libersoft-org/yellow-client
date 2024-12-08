<script>
 export let onClick;
 export let content;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

<style>
 .photo-card-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 50%;
  box-shadow: var(--shadow);
  cursor: pointer;
 }
</style>

<div class="photo-card-button" role="button" tabindex="0" on:click={onClick} on:keydown={handleKeydown}>{content}</div>
