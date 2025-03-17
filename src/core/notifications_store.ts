import { Store } from '@tauri-apps/plugin-store';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, debug } from './tauri.ts';
import { Window } from '@tauri-apps/api/window';
//import { message, confirm } from '@tauri-apps/plugin-dialog';

let stores: Map<String, Store> = new Map();

export async function store(id: string, reset: true): Promise<Store> {
 if (!CUSTOM_NOTIFICATIONS) return null;
 if (!stores.has(id)) {
  console.log('store: loading store:', id);
  let _store = await Store.load(id, { autoSave: false });
  console.log('_store:', _store);
  if (reset) {
   console.log('store: clearing store:', id);
   console.log('_store entries:', await _store.entries());
   await _store.clear();
   console.log('_store entries:', await _store.entries());
   console.log('store: reloading store:', id);
   await _store.reload();
  }
  stores.set(id, _store);
 }
 return stores.get(id);
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
