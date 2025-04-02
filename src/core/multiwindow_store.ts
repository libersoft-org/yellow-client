import { Store } from '@tauri-apps/plugin-store';
import { log } from './tauri.ts';

let stores: Map<String, Store> = new Map();

/*
Reliable one-way channel for communication between webview windows.
As opposed to tauri events, this handles situations where the reading window is not ready to receive the message. It can read the contents of the store when it is ready. Use with caution, ideally only in one direction. The main issue is that there is no way to reliably prevent the store from being saved when the app is closing, so, upon reopening, we have to clear the store, but if we were to clear it from both sides (windows), this would defeat the purpose.
todo: fork the plugin-store and add an option to prevent saving the store when the app is closing.
*/
export async function multiwindow_store(id: string, reset = true, autosave = false): Promise<Store> {
 if (!stores.has(id)) {
  //log.debug('store: loading store:', id);
  let _store = await Store.load(id, { autoSave: autosave });
  //log.debug('_store:', _store, 'reset:', reset);
  if (reset) {
   //log.debug('_store entries:', await _store.entri0es());
   //log.debug('store: clearing store:', id);
   await _store.clear();
   //log.debug('_store entries:', await _store.entries());
   //log.debug('store: reloading store:', id);
   //await _store.reload();
  }
  stores.set(id, _store);
 }
 let r = stores.get(id);
 if (!r) throw new Error('store not found: ' + id);
 return r;
}
