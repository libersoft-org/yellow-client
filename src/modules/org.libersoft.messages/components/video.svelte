<script>
 export let file;
</script>

<style>
 .video {
  display: flex;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
  max-width: 640px;
  max-height: 480px;
 }

 .video video {
  max-width: 100%;
  max-height: 100%;
 }
</style>

{#if file}
 <div class="video">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video controls>
   <source src={file} />
  </video>
 </div>
{/if}
