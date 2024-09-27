<script>
 export let img;
 export let title;
 export let id;
 export let click;
 
 function keyAction(id) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   click(id);
  }
 }
</script>

<style>
 .item {
  padding: 10px;
  background-color: red;
  cursor: pointer;
 }

 .item img {
  width: 20px;
  height: 20px;
 }
</style>

<div class="item" role="button" tabindex="0" on:click={() => click({id})} on:keydown={() => keyAction({id})}>
 <img src={img} alt="{title}" />
</div>
