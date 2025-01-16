import { writable } from 'svelte/store';
import { db } from './db.js';
export let stickerLibraryUpdaterState = writable({});
window.stickerLibraryUpdaterState = { updating: false };
import.meta.hot?.dispose(() => (window.stickerLibraryUpdaterState.updating = false));
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';

export let render_stickers_as_raster = localStorageSharedStore('render_stickers_as_raster', true);


export async function fetchStickerset(stickerServer, id = 0) {
 // This is a simple fetch of a single sticker set. There is some overlap with updateStickerLibrary, but it's not worth refactoring now
 id = Number(id);
 let response = await fetch(stickerServer + '/api/sets?id=' + id);
 response = await response.json();
 let sets = response?.data;
 let stickerset = sets[0];
 stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;
 stickerset.items.forEach(sticker => (sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name));
 return stickerset;
}

export async function updateStickerLibrary(stickerServer) {
 window.stickerLibraryUpdaterState.updating = true;
 stickerLibraryUpdaterState.set({ status: 'Downloading sticker sets from server ...', updating: true, progress: 0 });
 console.log('Loading list of stickersets from: ' + stickerServer);
 let startFetchSets = Date.now();
 let response = await fetch(stickerServer + '/api/sets');
 response = await response.json();
 let sets = response?.data;
 console.log('discovered ' + sets.length + ' stickersets in ' + (Date.now() - startFetchSets) + 'ms');
 // Delete all stickers that are part of stickerset that has server equal to stickerServer
 console.log('clearing old stickers from db...');
 stickerLibraryUpdaterState.set({ status: 'Removing old sticker list from local database ...', updating: true, progress: 3 });
 await db.transaction('rw', db.stickers, db.stickersets, async () => {
  let old_sets = await db.stickersets.where('server').equals(stickerServer).primaryKeys();
  console.log('delete old stickers...');
  await db.stickers.where('server').equals(stickerServer).delete();
  console.log('delete old sets:', old_sets.length, '...');
  stickerLibraryUpdaterState.set({ status: 'Removing old sticker sets list from local database ...', updating: true, progress: 10 });
  await db.stickersets.where('server').equals(stickerServer).delete();
 });
 console.log('Done clearing old stickers from db.');
 console.log('Removed db.stickersets:', await db.stickersets.toArray());
 console.log('Removed db.stickers:', await db.stickers.toArray());
 let stickersets_batch = [];
 for (let i = 0; i < sets.length; i++) {
  let stickerset = sets[i];
  let stickers = stickerset.items;
  delete stickerset.items;
  stickerset.server = stickerServer;
  stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;
  //if (i % 500 === 0) {
  stickerLibraryUpdaterState.set({ status: 'Saving sticker set list: ' + i + '/' + sets.length + ' to local database ...', updating: true, progress: (100 * i) / sets.length });
  //console.log('loading stickerset ' + i + '/' + sets.length);
  //await db.stickersets.bulkAdd(stickersets_batch);
  //stickersets_batch = [];
  //}
  //console.log('stickerset:', stickerset);
  stickersets_batch.push(stickerset);
  let stickers_batch = [];
  for (let sticker of stickers) {
   if (!window.stickerLibraryUpdaterState.updating) {
    console.log('Sticker library update cancelled');
    return;
   }
   sticker.stickerset = stickerset.id;
   sticker.server = stickerServer;
   sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
   stickers_batch.push(sticker);
  }
  await db.stickers.bulkAdd(stickers_batch);
 }
 stickerLibraryUpdaterState.set({ status: 'Loading sticker list ...', updating: true, progress: 100 });
 await db.stickersets.bulkAdd(stickersets_batch);
 stickerLibraryUpdaterState.set({ updating: false });
 console.log('Done loading, db.stickers.length:', await db.stickers.toArray().length);
 console.log('spent:', Date.now() - startFetchSets, 'ms');
}
