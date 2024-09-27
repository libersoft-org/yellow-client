<style>
 .loader {
 margin: 0 auto;
 width: 40px;
 height: 40px;
 border-radius: 50%;
 background:
  radial-gradient(farthest-side, var(--loader-color) 94%, transparent) top/8px 8px no-repeat,
  conic-gradient(transparent 30%, var(--loader-color));
 -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), var(--loader-color) 0);
 animation: loader 1s infinite linear;
}

@keyframes loader {
 100% {
  transform: rotate(1turn);
 }
}
</style>

<div class="loader"></div>
