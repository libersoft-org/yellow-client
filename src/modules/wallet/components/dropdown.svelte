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

<div class="dropdown" role="button" tabindex="0" on:click={onClick} on:keydown={keyDropdown}>
 <div class="text">{text}</div>
 <img src="img/down-black.svg" alt="▼" />
</div>

<style>
 .dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 0;
  border-radius: 10px;
  font-family: inherit;
  background-color: #ffa;
  cursor: pointer;
 }

 .dropdown .text {
  flex-grow: 1;
 }

 .dropdown img {
  width: 15px;
  height: 15px;
 }
</style>
