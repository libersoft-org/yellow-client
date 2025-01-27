import { writable, get } from 'svelte/store';
import { db } from './db.js';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';

void 'this is an extra state that safeguards against triggering the update after a HMR';
window.stickerLibraryUpdaterState = { updating: false };
import.meta.hot?.dispose(() => (window.stickerLibraryUpdaterState.updating = false));

export let stickerLibraryUpdaterState = writable({});
export let stickerset_favorites = localStorageSharedStore('stickerset_favorites', []);
export let sticker_servers = localStorageSharedStore('sticker_servers', ['https://stickers.libersoft.org']);
export let sticker_server = localStorageSharedStore('sticker_server', 'https://stickers.libersoft.org');
export let render_stickers_as_raster = localStorageSharedStore('render_stickers_as_raster', true);
export let animate_all_stickers = localStorageSharedStore('animate_all_stickers', false);

sticker_server.subscribe(() => {
 stickerLibraryUpdaterState.update(state => ({ ...state, updated_once: false }));
});

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

function setUpdateCancelled() {
 stickerLibraryUpdaterState.update(state => ({ ...state, updating: false }));
 window.stickerLibraryUpdaterState.updating = false;
}

function check_sticker_server_url(stickerServer) {
 if (!stickerServer || stickerServer === '') {
  stickerLibraryUpdaterState.update(state => ({ ...state, status: 'No sticker server URL set', error: true }));
  return false;
 }
 if (!stickerServer.startsWith('http://') && !stickerServer.startsWith('https://')) {
  stickerLibraryUpdaterState.update(state => ({ ...state, status: `Invalid sticker server URL: "${stickerServer}"`, error: true }));
  return false;
 }
 return true;
}

export async function updateStickerLibrary() {
 console.log('updateStickerLibrary...');

 if (window.stickerLibraryUpdaterState?.updating || get(stickerLibraryUpdaterState).updating) {
  console.log('Sticker library update already in progress');
  return;
 }

 window.stickerLibraryUpdaterState.updating = true;
 stickerLibraryUpdaterState.update(state => ({ ...state, status: `Update started ...`, updating: true, progress: 0, updated_once: true, error: null }));

 let stickerServer = get(sticker_server);
 if (!check_sticker_server_url(stickerServer)) {
  setUpdateCancelled();
  return;
 }

 stickerLibraryUpdaterState.update(state => ({ ...state, status: `Downloading sticker sets from {stickerServer} ...` }));
 console.log('Loading list of stickersets from: ' + stickerServer);
 let startFetchSets = Date.now();

 let response;
 try {
  response = await fetch(stickerServer + '/api/sets');
  response = await response.json();
 } catch (e) {
  console.error('Failed to fetch stickersets:', e);
  stickerLibraryUpdaterState.update(state => ({
   ...state,
   status: `Failed to fetch stickersets: ${e}`,
   error: true,
  }));
  setUpdateCancelled();
  return;
 }

 let sets = response?.data;
 console.log('discovered ' + sets.length + ' stickersets in ' + (Date.now() - startFetchSets) + 'ms');
 // Delete all stickers that are part of stickerset that has server equal to stickerServer
 console.log('clearing old stickers from db...');
 stickerLibraryUpdaterState.update(state => ({ ...state, status: 'Removing old stickers from local database ...', progress: 2 }));
 await db.transaction('rw', db.stickers, db.stickersets, async () => {
  let old_sets = await db.stickersets.where('server').equals(stickerServer).primaryKeys();
  console.log('delete old stickers...');
  await db.stickers.where('server').equals(stickerServer).delete();
  console.log('delete old sets:', old_sets.length, '...');
  stickerLibraryUpdaterState.update(state => ({ ...state, status: 'Removing old sticker sets from local database ...', progress: 5 }));
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
  stickerLibraryUpdaterState.update(state => ({ ...state, status: 'Saving sticker set list: ' + i + '/' + sets.length + ' to local database ...', progress: (100 * i) / sets.length }));
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
    stickerLibraryUpdaterState.set({ updating: false });
    return;
   }
   sticker.stickerset = stickerset.id;
   sticker.server = stickerServer;
   sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
   stickers_batch.push(sticker);
  }
  await db.stickers.bulkAdd(stickers_batch);
 }
 stickerLibraryUpdaterState.update(state => ({ status: 'Loading sticker list ...', progress: 100 }));
 await db.stickersets.bulkAdd(stickersets_batch);

 stickerLibraryUpdaterState.set({ updating: false });
 window.stickerLibraryUpdaterState.updating = false;
 console.log('Done loading, db.stickers.length:', await db.stickers.toArray().length);
 console.log('spent:', Date.now() - startFetchSets, 'ms');
}

export function add_stickerset_to_favorites(stickerset) {
 console.log('Add to favorites:', stickerset);
 let key = stickerset.url;
 let favorites = get(stickerset_favorites);
 if (favorites.indexOf(key) === -1) {
  favorites.push(key);
  stickerset_favorites.set(favorites);
 }
}

export function remove_stickerset_from_favorites(stickerset) {
 console.log('Remove from favorites:', stickerset);
 let key = stickerset.url;
 let favorites = get(stickerset_favorites);
 let index = favorites.indexOf(key);
 if (index !== -1) {
  favorites.splice(index, 1);
  stickerset_favorites.set(favorites);
 }
}

export function stickerset_in_favorites(stickerset) {
 let key = stickerset.url;
 let favorites = get(stickerset_favorites);
 return favorites.indexOf(key) !== -1;
}
