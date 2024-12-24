<script>
 import { onMount } from 'svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from '../components/stickerset.svelte';
 export let close;
 export let params;
 const library = localStorageSharedStore('stickers', {});
 let stickerSetData;

 onMount(async () => {
  const parsedUrl = new URL(params.stickersetDetailsModalStickerset);
  const stickerServer = `${parsedUrl.protocol}//${parsedUrl.host}`;
  const id = parsedUrl.searchParams.get('id');
  if ($library[stickerServer] === undefined) await updateStickerLibrary(library, stickerServer);
  stickerSetData = $library[stickerServer].find(obj => obj.id === Number(id));
 });
</script>

<div>
 {#if stickerSetData}
  <StickerSet stickerset={stickerSetData} showall="true" splitAt="0" />
 {/if}
</div>
