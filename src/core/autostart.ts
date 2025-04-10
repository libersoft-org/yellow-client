import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { TAURI } from "@/core/tauri.ts";

export async function enableAutostart() {
  if (TAURI) {
    await enable();
    console.log(`registered for autostart? ${await isEnabled()}`);
  }
}
