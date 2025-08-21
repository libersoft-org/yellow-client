import { get, writable } from 'svelte/store';
import type Window from '@/core/components/Window/Window.svelte';
import type BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
import type WindowWallets from '@/org.libersoft.wallet/windows/Wallets/Selection.svelte';

export let section = writable<string | null>('balance');
export const settingsWindow = writable<BaseSettings | null>(null);
export const walletsWindow = writable<WindowWallets | null>(null);
export const rpcServersWindow = writable<Window | null>(null);
export const networksWindow = writable<Window | null>(null);

export function setSection(name: string) {
	if (get(section) !== name) section.set(name);
}
