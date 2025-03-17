import { Store } from '@tauri-apps/plugin-store';
import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER } from './tauri.ts';

let _store: Store;

export async function store() {
 if (!CUSTOM_NOTIFICATIONS) return;
 if (_store) return _store;
 console.log('store: loading');
 _store = await Store.load('notifications', { autoSave: false });
 console.log('_store:', _store);
 return _store;
}
