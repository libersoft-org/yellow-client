<script lang="ts">
 interface Props {
  src: string
  alt: string
  ratio?: number
 }
 const {src, alt, ...rest}: Props = $props()
 const ratio = $derived(rest.ratio || 1)

</script>
<style>
 .image {
  position: relative;
  width: 100%;
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
  /*min-width: 100px;*/
  /*max-width: 100px;*/
 }

 .image-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: inherit;
  font-size: 0;
 }

 .image-container :global(img) {
  object-fit: cover;
  object-position: 50% 50%;
 }
</style>

<div class="image" role="img">
 <div style:padding-bottom={ratio * 100 + '%'}></div>
 <div class="image-container">
  <img src={src} alt={alt} loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" />
 </div>
</div>
