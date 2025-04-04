import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';

export async function enableAutostart() {
 await enable();
 console.log(`registered for autostart? ${await isEnabled()}`);
}
