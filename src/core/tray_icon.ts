//import { handleIconState } from '@tauri-apps/plugin-positioner';
import { TrayIcon } from '@tauri-apps/api/tray';
import { log, TAURI, TAURI_MOBILE } from './tauri.ts';
//import { resolveResource } from "@tauri-apps/api/path";
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Menu } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';
import { CheckMenuItem } from '@tauri-apps/api/menu/checkMenuItem';
import { showTrayIcon } from '@/core/settings.ts';
import { get } from 'svelte/store';
import { product } from '@/core/core.js';

let tray: TrayIcon | string | null = null;

async function showWindow() {
 log.debug('showWindow');
 await getCurrentWindow().show();
 await getCurrentWindow().setFocus();
 await getCurrentWindow().unminimize();
}

async function hideWindow() {
 log.debug('Hide action');
 await getCurrentWindow().hide();
}

export async function createTrayIcon() {
 log.debug('createTrayIcon tray:', tray);
 if (tray) {
  return;
 }
 tray = 'loading';
 if (!get(showTrayIcon)) {
  log.debug('Tray icon not enabled');
  return;
 }
 if (TAURI && !TAURI_MOBILE) {
  // Get the path to the icon file
  const iconPath = await defaultWindowIcon();
  //resolveResource('icons/icon.png');

  const action = async event => {
   log.debug(`TrayIcon event: ${event.type}`);
   // add the handle in the action to update the state
   //await handleIconState(event);
   if (event.type === 'Click') {
    await showWindow();
   }
  };
  const options = {
   id: 'main',
   icon: iconPath || '',
   action,
   menu: await Menu.new({
    id: 'main',
    items: [
     {
      id: 'show',
      text: 'Show',
      action: async () => {
       await showWindow();
      },
     },
     await CheckMenuItem.new({
      text: 'Notifications',
      id: 'notifications',

      action: async () => {
       log.debug('Notifications action');
      },
     }),
     {
      id: 'quit',
      text: 'Quit',
      action: async () => {
       log.debug('Quit action');
       await exit(0);
      },
     },
    ],
   }),
   showMenuOnLeftClick: false,
   tooltip: product,
  };
  tray = await TrayIcon.new(options);
  log.debug('TrayIcon created:', tray);
 }
}

export async function destroyTrayIcon() {
 if (TAURI && !TAURI_MOBILE) {
  log.debug('destroyTrayIcon');

  {
   if (tray && tray != 'loading') await tray.close();
   TrayIcon.removeById('main');
   log.debug('TrayIcon closed');
   tray = null;
  }
 }
}
