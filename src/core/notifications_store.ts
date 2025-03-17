import { Store } from '@tauri-apps/plugin-store';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER } from './tauri.ts';

let stores: Map<String, Store> = new Map();

export async function store(id: string): Promise<Store> {
 if (!CUSTOM_NOTIFICATIONS) return null;
 if (!stores.has(id)) {
  console.log('store: loading store:', id);
  let _store = await Store.load(id, { autoSave: false });
  console.log('_store:', _store);
  stores.set(id, _store);
 }
 return stores.get(id);
}
