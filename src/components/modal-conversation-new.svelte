<script>
 function clickOpen() {
  //TODO: open new conversation
  //TODO: close this modal
 }

 function keyOpen() {
 if (event.key === 'Enter' || event.key === ' ') {
  event.preventDefault();
  clickClose();
 }
}
</script>

<style>
</style>

<div>
 <div>Address:</div>
 <div><input type="text" /></div>
 <div class="button" role="button" tabindex="0" on:click={clickOpen} on:keydown={keyOpen}>Open</div>
</div>
