import { get } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { log, TAURI_MOBILE } from '@/core/tauri.ts';
import { selectAccount } from './accounts.ts';
import { getGuid } from './utils/utils.ts';
import { invoke } from '@tauri-apps/api/core';
import type { AccountConfig, AccountCredentials, AccountSettings } from './types.ts';
import type { Writable } from 'svelte/store';
export const accounts_config: Writable<AccountConfig[]> = localStorageSharedStore('accounts_config', import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS ? JSON.parse(import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS) : []);

export function accounts_config_init(): () => void {
	if (!TAURI_MOBILE) {
		return () => {}; // No-op unsubscriber for non-mobile
	}

	// Sync accounts config to native storage on mobile
	return accounts_config.subscribe(async (configs: AccountConfig[]) => {
		try {
			const jsonData = JSON.stringify(configs);
			log.debug('Syncing accounts config to native storage:', configs.length, 'accounts');

			await invoke('plugin:yellow|save_accounts_config', {
				configJson: jsonData,
			});

			log.debug('Accounts config synced successfully');
		} catch (error) {
			log.error('Failed to sync accounts config to native storage:', error);
		}
	});
}

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
	const identifier = `${address}@${server}`;
	return currentConfig.some(account => {
		const accountServer = account.credentials?.server;
		const accountAddress = account.credentials?.address;
		return `${accountAddress}@${accountServer}` === identifier;
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

export function validateAccountConfig(account: any): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check if account is an object
	if (!account || typeof account !== 'object') {
		errors.push('Account must be an object');
		return { valid: false, errors };
	}

	// Check required fields
	if (!account.id || typeof account.id !== 'string') {
		errors.push('Account must have a valid id (string)');
	}

	if (typeof account.enabled !== 'boolean') {
		errors.push('Account must have enabled field (boolean)');
	}

	// Validate credentials
	if (!account.credentials || typeof account.credentials !== 'object') {
		errors.push('Account must have credentials object');
	} else {
		if (!account.credentials.server || typeof account.credentials.server !== 'string') {
			errors.push('Credentials must have server (string)');
		} else if (account.credentials.server.trim() === '') {
			errors.push('Server cannot be empty');
		}

		if (!account.credentials.address || typeof account.credentials.address !== 'string') {
			errors.push('Credentials must have address (string)');
		} else if (account.credentials.address.trim() === '') {
			errors.push('Address cannot be empty');
		}

		if (typeof account.credentials.password !== 'string') {
			errors.push('Credentials must have password (string)');
		}
	}

	// Validate settings (must be object, but can be empty)
	if (!account.settings || typeof account.settings !== 'object') {
		errors.push('Account must have settings object');
	}

	return { valid: errors.length === 0, errors };
}

export function validateAccountsArray(data: any): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check if data is an array
	if (!Array.isArray(data)) {
		errors.push('Import data must be an array of accounts');
		return { valid: false, errors };
	}

	// Check if array is empty
	if (data.length === 0) {
		errors.push('No accounts found in import data');
		return { valid: false, errors };
	}

	// Validate each account
	data.forEach((account, index) => {
		const validation = validateAccountConfig(account);
		if (!validation.valid) {
			validation.errors.forEach(error => {
				errors.push(`Account ${index + 1}: ${error}`);
			});
		}
	});

	return { valid: errors.length === 0, errors };
}
