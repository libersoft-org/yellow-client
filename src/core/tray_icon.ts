import { handleIconState, moveWindow, Position } from '@tauri-apps/plugin-positioner';
import { TrayIcon } from '@tauri-apps/api/tray';
import { log } from './tauri.ts';

export async function createTrayIcon() {
 const action = async event => {
  log.debug(`TrayIcon event: ${event.type}`);
  // add the handle in the action to update the state
  await handleIconState(event);

  if (event.type === 'Click') {
   // note this option requires enabling the `tray-icon`
   //   feature in the Cargo.toml
   await moveWindow(Position.TrayLeft);
  }
 };
 const options = {
  id: 'main',
  action,
 };
 const tray = await TrayIcon.new(options);
 log.debug('TrayIcon created:', tray);
}
