import { Store } from '@tauri-apps/plugin-store';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, debug } from './tauri.ts';
import { Window } from '@tauri-apps/api/window';
//import { message, confirm } from '@tauri-apps/plugin-dialog';

let stores: Map<String, Store> = new Map();

export async function store(id: string, reset = true, autosave = false): Promise<Store> {
 if (!stores.has(id)) {
  debug('store: loading store:', id);
  let _store = await Store.load(id, { autoSave: autosave });
  debug('_store:', _store, 'reset:', reset);
  if (reset) {
   debug('_store entries:', await _store.entries());
   debug('store: clearing store:', id);
   await _store.clear();
   debug('_store entries:', await _store.entries());
   //debug('store: reloading store:', id);
   //await _store.reload();
  }
  stores.set(id, _store);
 }
 let r = stores.get(id);
 if (!r) throw new Error('store not found: ' + id);
 return r;
}
//
//const appWindow = new Window('tauri-app');
// const unlisten = await appWindow.onCloseRequested(async (event) => {
//  debug('onCloseRequested');
//  // const confirmed = await confirm('Are you sure?');
//  // if (!confirmed) {
//  //  // user did not confirm closing the window; let's prevent it
//  //  event.preventDefault();
//  // }
// });
