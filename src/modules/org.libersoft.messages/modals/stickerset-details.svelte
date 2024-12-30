<script>
 import { debug } from '../../../core/core.js';
 import { onMount } from 'svelte';
 import { localStorageSharedStore } from '../../../lib/svelte-shared-store.ts';
 import { updateStickerLibrary } from '../messages.js';
 import StickerSet from '../components/stickerset.svelte';
 export let params;
 const library = localStorageSharedStore('stickers', {});
 let stickerSetData;

 let stickerServer;
 let id;

 onMount(async () => {
  const parsedUrl = new URL(params.stickersetDetailsModalStickerset);
  stickerServer = `${parsedUrl.protocol}//${parsedUrl.host}`;
  id = parsedUrl.searchParams.get('id');
  if ($library[stickerServer] === undefined) await updateStickerLibrary(library, stickerServer);
  stickerSetData = $library[stickerServer].find(obj => obj.id === Number(id));
 });
</script>

<div>
 {#if $debug}
  stickerServer: {stickerServer}
  id: {id}
 {/if}
 TODO
 {#if stickerSetData}
  <StickerSet stickerset={stickerSetData} showall="true" splitAt="0" />
 {/if}
</div>
