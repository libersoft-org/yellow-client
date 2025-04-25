import { handleIconState } from '@tauri-apps/plugin-positioner';
import { TrayIcon } from '@tauri-apps/api/tray';
import { log, TAURI, TAURI_MOBILE } from './tauri.ts';
//import { resolveResource } from "@tauri-apps/api/path";
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { Menu } from '@tauri-apps/api/menu';
import { exit } from '@tauri-apps/plugin-process';
import { CheckMenuItem } from '@tauri-apps/api/menu/checkMenuItem';

let tray: TrayIcon | null = null;

export async function createTrayIcon() {
 if (TAURI && !TAURI_MOBILE) {
  // Get the path to the icon file
  const iconPath = await defaultWindowIcon();
  //resolveResource('icons/icon.png');

  const action = event => {
   log.debug(`TrayIcon event: ${event.type}`);
   // add the handle in the action to update the state
   //await handleIconState(event);
   window.focus();
   if (event.type === 'Click') {
    log.debug('TrayIcon Click event');
   }
  };
  const options = {
   icon: iconPath || '',
   action,
   menu: await Menu.new({
    id: 'main',
    items: [
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
   tooltip: 'awesome tray tooltip',
  };
  tray = await TrayIcon.new(options);
  log.debug('TrayIcon created:', tray);
 }
}

export async function destroyTrayIcon() {
 if (TAURI && !TAURI_MOBILE) {
  log.debug('destroyTrayIcon');
  if (tray) {
   await tray.close();
   log.debug('TrayIcon closed');
   tray = null;
  }
 }
}
