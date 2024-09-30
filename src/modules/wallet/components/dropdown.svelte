<script>
 export let text;
 export let onClick;

  function keyDropdown() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick();
  }
 }
</script>

<style>
 .dropdown {
  padding: 5px;
  border: 0;
  border-radius: 10px;
  font-family: inherit;
  background-color: #ffa;
  cursor: pointer;
 }
</style>

<div class="dropdown" role="button" tabindex="0" on:click={onClick} on:keydown={keyDropdown}>{text}</div>
