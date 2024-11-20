<script>
 export let show = true;
</script>

<style>
 :root {
  --spinner-color: #000;
 }

 .container {
  min-height: 40px;
 }

 .spinner {
  padding: 10px;
  margin: 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background:
   radial-gradient(farthest-side, var(--spinner-color) 94%, transparent) top/8px 8px no-repeat,
   conic-gradient(transparent 30%, var(--spinner-color));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), var(--spinner-color) 0);
  animation: spinner 1s infinite linear;
 }

 @keyframes spinner {
  100% {
   transform: rotate(1turn);
  }
 }
</style>

<div class="container">
 {#if show}
  <div class="spinner"></div>
 {/if}
</div>
