import { log } from "@/core/tauri.ts";

export function friendlyTimestamp(date: Date | string | number) {
    log.debug('friendlyTimestamp', date);
    let result = new Date(date)
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z/, '');
    log.debug('friendlyTimestamp result', result);
    return result;
}
