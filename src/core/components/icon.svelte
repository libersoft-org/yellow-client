<script>
 export let img;
 export let alt = '';
 export let size = 24;
 export let padding = 10;
 export let onClick;
 export let visibleOnMobile = true;
 export let visibleOnDesktop = true;

 function handleKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick();
  }
 }
</script>

<style>
 .icon {
  padding: 10px;
  cursor: pointer;
 }

 .icon img {
  display: flex;
 }

 @media (max-width: 767px) {
  .hideOnMobile {
   display: none;
  }
 }

 @media (min-width: 768px) {
  .hideOnDesktop {
   display: none;
  }
 }
</style>

{#if img}
 <div class="icon {visibleOnMobile ? '' : 'hideOnMobile'} {visibleOnDesktop ? '' : 'hideOnDesktop'}" style="padding: {padding}px;" role="button" tabindex="0" on:click={onClick} on:keydown={handleKey}>
  <img style="width: {size}px; height: {size}px;" src={img} {alt} />
 </div>
{/if}
