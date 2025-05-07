<script>
 import { photoRadius } from '../../messages.js';
 export let img = 'img/photo.svg';
 export let alt = '';
 export let size = 50;
</script>

<style>
 .photo {
  border: 1px solid #000;
  background-color: #fff;

  overflow: hidden;
 }

 .photo img {
  display: flex;
  margin: 5px;
  padding-top: 5px;
 }
</style>

<div class="photo" style="min-width: {size}px; min-height: {size}px; width: {size}px; height: {size}px; border-radius: {$photoRadius};">
 <img src={img} {alt} />
</div>
