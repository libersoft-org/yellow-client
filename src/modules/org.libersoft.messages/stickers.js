import { writable, get, derived } from 'svelte/store';
import { stickers_db } from './db.ts';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';

// TODO: this is an extra state that safeguards against triggering the update after a HMR
window.stickerLibraryUpdaterState = { updating: false };
import.meta.hot?.dispose(() => (window.stickerLibraryUpdaterState.canceled = true));

export let stickerLibraryUpdaterState = writable({});
export let stickerset_favorites = localStorageSharedStore('stickerset_favorites', []);

stickerLibraryUpdaterState.subscribe(state => {
	console.log('stickerLibraryUpdaterState:', state);
	window.stickerLibraryUpdaterState = state;
});

export let sticker_servers = localStorageSharedStore('sticker_servers', ['https://stickers.libersoft.org']);
export let sticker_server_index = localStorageSharedStore('sticker_server_index', 0);
export let sticker_server = localStorageSharedStore('sticker_server');

function update_sticker_server() {
	let servers = get(sticker_servers);
	let index = get(sticker_server_index);
	if (get(sticker_server) !== servers[index]) sticker_server.set(servers[index]);
}
sticker_servers.subscribe(update_sticker_server);
sticker_server_index.subscribe(update_sticker_server);

sticker_server.subscribe(() => {
	console.log('sticker_server changed:', get(sticker_server));
	//stickerLibraryUpdaterState.update(state => ({ ...state, updated_once: false }));
});

function sanitizeStickerServerUrl(url) {
	return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function fetchStickerset(stickerServer, id = 0) {
	// This is a simple fetch of a single sticker set. There is some overlap with updateStickerLibrary, but it's not worth refactoring now
	id = Number(id);
	let response = await fetch(sanitizeStickerServerUrl(stickerServer) + '/api/sets?id=' + id);
	response = await response.json();
	let sets = response?.data;
	let stickerset = sets[0];
	stickerset.url = stickerServer + '/api/sets?id=' + stickerset.id;
	stickerset.items.forEach(sticker => (sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name));
	return stickerset;
}

function setUpdatingFalse() {
	stickerLibraryUpdaterState.update(state => ({ ...state, updating: false }));
}

function check_sticker_server_url(stickerServer) {
	if (!stickerServer || stickerServer === '') {
		stickerLibraryUpdaterState.update(state => ({ ...state, status: 'No sticker server URL set', error: true }));
		return false;
	}
	if (!stickerServer.startsWith('http://') && !stickerServer.startsWith('https://')) {
		stickerLibraryUpdaterState.update(state => ({
			...state,
			status: `Invalid sticker server URL: "${stickerServer}"`,
			error: true,
		}));
		return false;
	}
	return true;
}

export async function updateStickerLibrary() {
	console.log('updateStickerLibrary	called');
	if (window.stickerLibraryUpdaterState?.updating) {
		console.log('Sticker library update already in progress');
		return;
	}
	if (window.stickerLibraryUpdaterState?.canceled) {
		console.log('Sticker library update canceled');
		return;
	}
	stickerLibraryUpdaterState.update(state => ({
		...state,
		status: 'Update started ...',
		updating: true,
		progress: 0,
		updated_once: true,
		error: null,
		canceled: false,
	}));
	let stickerServer = get(sticker_server);
	if (!check_sticker_server_url(stickerServer)) {
		setUpdatingFalse();
		return;
	}
	let stickerServer2 = sanitizeStickerServerUrl(stickerServer);
	stickerLibraryUpdaterState.update(state => ({
		...state,
		status: 'Downloading sticker sets from ' + stickerServer + ' ...',
	}));
	console.log('Loading list of stickersets from: ' + stickerServer);
	let startFetchSets = Date.now();
	let response;
	try {
		response = await fetch(stickerServer2 + '/api/sets');
		response = await response.json();
	} catch (e) {
		console.error('Failed to fetch stickersets:', e);
		stickerLibraryUpdaterState.update(state => ({
			...state,
			status: 'Failed to fetch stickersets: ' + e,
			error: true,
		}));
		setUpdatingFalse();
		return;
	}
	let sets = response?.data;
	console.log('Discovered ' + sets.length + ' sticker sets in ' + (Date.now() - startFetchSets) + 'ms');
	// Delete all stickers that are part of stickerset that has server equal to stickerServer
	console.log('Clearing old stickers from local database...');
	await stickers_db.transaction('rw', stickers_db.stickers, stickers_db.stickersets, async () => {
		//let old_sets = await stickers_db.stickersets.where('server').equals(stickerServer).primaryKeys();
		//console.log('delete old sets:', old_sets.length, '...');
		stickerLibraryUpdaterState.update(state => ({
			...state,
			status: 'Deleting old sticker sets from local database ...',
			progress: 5,
		}));
		await stickers_db.stickersets.where('server').equals(stickerServer).delete();
		console.log('Delete old stickers...');
		stickerLibraryUpdaterState.update(state => ({
			...state,
			status: 'Deleting old stickers from local database ...',
			progress: 10,
		}));
		await stickers_db.stickers.where('server').equals(stickerServer).delete();
	});
	console.log('Done clearing old stickers from database.');
	console.log('Removed db.stickersets:', await stickers_db.stickersets.toArray());
	console.log('Removed db.stickers:', await stickers_db.stickers.toArray());
	let stickersets_batch = [];
	let stickers_batch = [];
	for (let i = 0; i < sets.length; i++) {
		let stickerset = sets[i];
		let stickers = stickerset.items;
		delete stickerset.items;
		stickerset.server = stickerServer;
		stickerset.url = stickerServer2 + '/api/sets?id=' + stickerset.id;
		if (i % 50 === 0) {
			stickerLibraryUpdaterState.update(state => ({
				...state,
				status: 'Saving sticker set ' + i + '/' + sets.length + '...',
				progress: (100 * i) / sets.length,
			}));
			//console.log('Loading sticker set ' + i + '/' + sets.length);
			//await stickers_db.stickersets.bulkAdd(stickersets_batch.splice(0, stickersets_batch.length));
			await stickers_db.stickers.bulkAdd(stickers_batch.splice(0, stickers_batch.length));
		}
		if (window.stickerLibraryUpdaterState.canceled) {
			console.log('Sticker library update canceled');
			stickerLibraryUpdaterState.update(state => ({
				...state,
				status: 'Sticker library update canceled',
				progress: 100,
				updating: false,
			}));
			return;
		}
		//console.log('stickerset:', stickerset);
		stickersets_batch.push(stickerset);
		for (let sticker of stickers) {
			sticker.stickerset = stickerset.id;
			sticker.server = stickerServer;
			sticker.url = stickerServer + '/download/' + (stickerset.animated ? 'animated' : 'static') + '/' + stickerset.alias + '/' + sticker.name;
			stickers_batch.push(sticker);
		}
	}
	await stickers_db.stickers.bulkAdd(stickers_batch);
	stickerLibraryUpdaterState.update(state => ({ ...state, status: 'Loading sticker list ...', progress: 100 }));
	await stickers_db.stickersets.bulkAdd(stickersets_batch);
	console.log('Done loading, db.stickers.count:', await stickers_db.stickers.count(), 'db.stickersets.count:', await stickers_db.stickersets.count());
	console.log('Spent:', Date.now() - startFetchSets, 'ms');
	stickerLibraryUpdaterState.update(state => ({
		...state,
		status: 'Sticker library updated',
		progress: 100,
		updating: false,
	}));
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
