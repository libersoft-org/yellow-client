<script>
  import { photoRadius } from '../../messages.ts';
  export let img = 'img/photo.svg';
  export let alt = '';
  export let size = '50px';
</script>

<div
  class="photo"
  style="min-width: {size}; min-height: {size}; width: {size}; height: {size}; border-radius: {$photoRadius};"
>
  <img src={img} {alt} />
</div>

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
