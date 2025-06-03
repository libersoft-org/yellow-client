import { get } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { log } from '@/core/tauri.ts';
import { selectAccount } from './accounts.ts';
import { getGuid } from './utils/utils.ts';
import type { AccountConfig, AccountCredentials, AccountSettings } from './types.ts';
import type { Writable } from 'svelte/store';

export const accounts_config: Writable<AccountConfig[]> = localStorageSharedStore('accounts_config', import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS ? JSON.parse(import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS) : []);

export function addAccount(config: Partial<AccountConfig>, settings: AccountSettings): string {
	console.log('addAccount(config, settings)', config, settings);
	const id = getGuid();
	accounts_config.update(v => [
		...v,
		{
			id,
			enabled: config.enabled ?? true,
			credentials: config.credentials as AccountCredentials,
			settings,
		} as AccountConfig,
	]);
	selectAccount(id);
	return id;
}

export function saveAccount(id: string, config: Partial<AccountConfig>, settings: AccountSettings): void {
	console.log('saveAccount', id, config, settings);
	accounts_config.update(v => {
		for (const acc of v) {
			if (acc.id === id) {
				// Update config properties
				Object.entries(config).forEach(([key, value]) => {
					(acc as any)[key] = value;
				});

				// Update settings
				if (!acc.settings) acc.settings = {};
				Object.entries(settings).forEach(([key, value]) => {
					acc.settings[key] = value;
				});
			}
			console.log('saveAccount acc config:', JSON.stringify(acc));
		}
		return v;
	});
}

export function delAccount(id: string): void {
	accounts_config.update(v => v.filter(a => a.id !== id));
}

export function findAccountConfig(id: string): AccountConfig | undefined {
	return get(accounts_config).find(a => a.id === id);
}

export function accountConfigExistsByCredentials(server: string, address: string): boolean {
	const currentConfig = get(accounts_config);
	const identifier = `${server}\\\\${address}`;
	return currentConfig.some(account => {
		const accountServer = account.credentials?.server || (account as any).server;
		const accountAddress = account.credentials?.address || (account as any).address;
		return `${accountServer}\\\\${accountAddress}` === identifier;
	});
}

export function toggleAccountEnabled(id: string): void {
	log.debug('TOGGLE ACCOUNT ENABLED accounts_config', accounts_config);
	log.debug('TOGGLE ACCOUNT ENABLED id', id);
	accounts_config.update(v =>
		v.map(a => {
			if (a.id === id) a.enabled = !a.enabled;
			return a;
		})
	);
}
