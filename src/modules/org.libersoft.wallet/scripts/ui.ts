import { get, writable } from 'svelte/store';
export let section = writable<string | null>('balance');
export const settingsWindow = writable<any>();
export const walletsWindow = writable<any>();
export const rpcServersWindow = writable<any>();

export function setSection(name: string) {
	if (get(section) !== name) section.set(name);
}
