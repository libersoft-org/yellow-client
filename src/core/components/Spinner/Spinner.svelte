<script lang="ts">
 interface Props {
  show?: boolean;
  color?: string;
  size?: string;
  containerMinHeight?: string;
 }

 let { show = true, color = '#000000', size = '40px', containerMinHeight = '72px' }: Props = $props();
</script>

<style>
 .container {
 }

 .spinner {
  padding: 10px;
  margin: 0 auto;
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

<div class="container" style="--spinner-color: {color}" style:min-height={containerMinHeight}>
 {#if show}
  <div class="spinner" style:width={size} style:height={size}></div>
 {/if}
</div>
