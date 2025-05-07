import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
import { currentMonitor, getCurrentWindow, PhysicalSize } from '@tauri-apps/api/window';
import { confirm } from '@tauri-apps/plugin-dialog';
import { exit } from '@tauri-apps/plugin-process';
import { closeToMinimize, runOnSystemStartup, showTrayIcon } from '@/core/settings.ts';
import { get } from 'svelte/store';
import { disable, enable } from '@tauri-apps/plugin-autostart';
import { createTrayIcon, destroyTrayIcon } from '@/core/tray_icon.ts';
import { TAURI, TAURI_MOBILE, log } from './tauri.ts';

export async function setDefaultWindowSize() {
 if (!TAURI || TAURI_MOBILE) {
  return;
 }
 let w = getCurrentWindow();
 const size = await getCurrentWindow().innerSize();
 log.debug('size', size);
 if (size.width === 500 && size.height === 500) {
  log.debug('setting default size');
  const monitor_size = (await currentMonitor())?.size || {
   width: 1280,
   height: 720,
  };
  let new_size = new PhysicalSize(monitor_size.width * 0.8, monitor_size.height * 0.8);
  await w.setSize(new_size);
  setTimeout(async () => {
   await w.center();
  }, 200);
 }
}

export async function initWindow() {
 if (!TAURI || TAURI_MOBILE) {
  return;
 }
 const unlisten = await getCurrentWindow().onCloseRequested(async event => {
  /*const confirmed = await confirm('Are you sure?');
   if (confirmed) {
     await quit();
   }*/
  if (get(closeToMinimize)) {
   log.debug('hiding window');
   await getCurrentWindow().hide();
  } else {
   await quit();
  }
 });

 runOnSystemStartup.subscribe(async value => {
  if (!TAURI) return;
  log.debug('runOnSystemStartup changed:', value);
  if (value) {
   await enable();
  } else {
   await disable();
  }
 });

 showTrayIcon.subscribe(async value => {
  if (!TAURI) return;
  log.debug('showTrayIcon changed:', value, 'createTrayIcon.');
  if (value) {
   await createTrayIcon();
  } else {
   await destroyTrayIcon();
  }
 });
}

async function quit() {
 await invoke('close_notifications_window');
 await exit(0);
}

export async function getNativeClientBuildCommitHash() {
 if (!TAURI) {
  return '';
 }
 const hash = await invoke('get_build_commit_hash');
 log.debug('native client hash', hash);
 return hash;
}

export async function getNativeClientBuildTs() {
 if (!TAURI) {
  return '';
 }
 const ts = await invoke('get_build_ts');
 log.debug('native client build ts', ts);
 return ts;
}
