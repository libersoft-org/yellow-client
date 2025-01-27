<script>
 import StickersView from './stickers-view.svelte';

 let view;
 export function onShow() {
  view.onShow();
 }
</script>

<StickersView bind:this={view} />
