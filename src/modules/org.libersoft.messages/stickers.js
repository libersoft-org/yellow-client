import { writable } from 'svelte/store';
import { db } from './db.js';

export let stickerLibraryUpdaterState = writable({});

window.stickerLibraryUpdaterState = { updating: false };
import.meta.hot?.dispose(() => {
 window.stickerLibraryUpdaterState.updating = false;
});

export async function fetchStickerset(stickerServer, id = 0) {
 void "this is a simple fetch of a single sticker. There is some overlap with updateStickerLibrary, but it's not worth refactoring now.";
 id = Number(id);
 let response = await fetch(stickerServer + '/api/sets?id=' + id);
 response = await response.json();
 let sets = response?.data;
 let stickerset = sets[0];
 stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;
 stickerset.items.forEach(sticker => {
  sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
 });
 return stickerset;
}

export async function updateStickerLibrary(stickerServer) {
 window.stickerLibraryUpdaterState.updating = true;
 stickerLibraryUpdaterState.set({ status: 'Downloading stickersets from server ...', updating: true, progress: 0 });
 console.log('loading list of stickersets from ' + stickerServer);
 let startFetchSets = Date.now();
 let response = await fetch(stickerServer + '/api/sets');
 response = await response.json();
 let sets = response?.data;
 console.log('discovered ' + sets.length + ' stickersets in ' + (Date.now() - startFetchSets) + 'ms');

 // delete all stickers that are part of stickerset that has server equal to stickerServer
 console.log('clearing old stickers from db...');
 stickerLibraryUpdaterState.set({ status: 'Clearing old stickers from db ...', updating: true, progress: 3 });
 await db.transaction('rw', db.stickers, db.stickersets, async () => {
  let old_sets = await db.stickersets.where('server').equals(stickerServer).primaryKeys();
  console.log('delete old stickers...');
  await db.stickers.where('server').equals(stickerServer).delete();
  console.log('delete old sets:', old_sets.length, '...');
  stickerLibraryUpdaterState.set({ status: 'Clearing old stickersets from db ...', updating: true, progress: 10 });
  await db.stickersets.where('server').equals(stickerServer).delete();
 });
 console.log('done clearing old stickers from db.');
 console.log('cleared db.stickersets:', await db.stickersets.toArray());
 console.log('cleared db.stickers:', await db.stickers.toArray());

 let stickersets_batch = [];
 for (let i = 0; i < sets.length; i++) {
  let stickerset = sets[i];
  let stickers = stickerset.items;
  delete stickerset.items;
  stickerset.server = stickerServer;
  stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;

  if (i % 100 === 0) {
   stickerLibraryUpdaterState.set({ status: 'Loading stickerset ' + i + '/' + sets.length, updating: true, progress: (100 * i) / sets.length });
   console.log('loading stickerset ' + i + '/' + sets.length);
   await db.stickersets.bulkAdd(stickersets_batch);
   stickersets_batch = [];
  }
  console.log('stickerset:', stickerset);
  stickersets_batch.push(stickerset);

  let stickers_batch = [];
  for (let sticker of stickers) {
   if (!window.stickerLibraryUpdaterState.updating) {
    console.log('sticker library update cancelled');
    return;
   }
   sticker.stickerset = stickerset.id;
   sticker.server = stickerServer;
   sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
   stickers_batch.push(sticker);
  }
  await db.stickers.bulkAdd(stickers_batch);
 }
 stickerLibraryUpdaterState.set({ status: 'Finalizing ...', updating: true, progress: 100 });
 await db.stickersets.bulkAdd(stickersets_batch);

 stickerLibraryUpdaterState.set({ updating: false });
 console.log('done loading, db.stickers.length:', await db.stickers.toArray().length);
}
