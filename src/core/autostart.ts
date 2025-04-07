import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { IS_TAURI } from '@/core/tauri.ts';

export async function enableAutostart() {
 if (IS_TAURI) {
  await enable();
  console.log(`registered for autostart? ${await isEnabled()}`);
 }
}
