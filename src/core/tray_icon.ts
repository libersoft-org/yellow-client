import {
  handleIconState,
  moveWindow,
  Position,
} from "@tauri-apps/plugin-positioner";
import { TrayIcon } from "@tauri-apps/api/tray";
import { IS_TAURI, IS_TAURI_MOBILE, log } from "./tauri.ts";
import { resolveResource } from "@tauri-apps/api/path";
import { defaultWindowIcon } from "@tauri-apps/api/app";

export async function createTrayIcon() {
  if (IS_TAURI && !IS_TAURI_MOBILE) {
    try {
      // Get the path to the icon file
      const iconPath = await defaultWindowIcon();
      //resolveResource('icons/icon.png');

      const action = async (event) => {
        log.debug(`TrayIcon event: ${event.type}`);
        // add the handle in the action to update the state
        await handleIconState(event);

        if (event.type === "Click") {
          // note this option requires enabling the `tray-icon`
          //   feature in the Cargo.toml
          await moveWindow(Position.TrayLeft);
        }
      };
      const options = {
        id: "main",
        icon: iconPath,
        action,
        tooltip: "awesome tray tooltip",
      };
      const tray = await TrayIcon.new(options);
      log.debug("TrayIcon created:", tray);
    } catch (error) {
      log.debug("Error creating tray icon:", error);
    }
  }
}
