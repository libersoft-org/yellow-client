<script>
 import StickersView from './stickers-view.svelte';
 import { stickerset_favorites } from '../stickers';

 let view;
 export function onShow() {
  view.onShow();
 }
</script>

<StickersView bind:this={view} stickerset_favorites={$stickerset_favorites} />
