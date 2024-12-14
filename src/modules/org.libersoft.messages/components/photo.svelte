<script>
 export let size = 50;
</script>

<style>
 .photo {
  border: 1px solid #000;
  background-color: #fff;
  border-radius: 50%;
  overflow: hidden;
 }

 .photo img {
  display: flex;
  margin: 5px;
  padding-top: 5px;
 }
</style>

<div class="photo" style="min-width: {size}px; min-height: {size}px; width: {size}px; height: {size}px;">
 <img src="img/photo.svg" alt="" />
</div>
