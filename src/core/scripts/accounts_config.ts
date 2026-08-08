import { get } from 'svelte/store';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';
import { log, TAURI_MOBILE } from '@/core/scripts/tauri.ts';
import { selectAccount } from './accounts.ts';
import { getGuid } from './utils/utils.ts';
import { invoke } from '@tauri-apps/api/core';
import type { IAccountConfig, IAccountCredentials, IAccountSettings } from './types.ts';
import type { Writable } from 'svelte/store';
export const accounts_config: Writable<IAccountConfig[]> = localStorageSharedStore('accounts_config', import.meta.env['VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS'] ? JSON.parse(import.meta.env['VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS']) : []);

export function accounts_config_init(): () => void {
	if (!TAURI_MOBILE) {
		return () => {}; // No-op unsubscriber for non-mobile
	}

	// Sync accounts config to native storage on mobile
	return accounts_config.subscribe(async (configs: IAccountConfig[]) => {
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

export function addAccount(config: Partial<IAccountConfig>, settings: IAccountSettings): string {
	log.debug('addAccount for server:', config.credentials?.server);
	const id = getGuid();
	accounts_config.update(v => [
		...v,
		{
			id,
			enabled: config.enabled ?? true,
			credentials: config.credentials as IAccountCredentials,
			settings,
		} as IAccountConfig,
	]);
	selectAccount(id);
	return id;
}

export function saveAccount(id: string, config: Partial<IAccountConfig>, settings: IAccountSettings): void {
	log.debug('saveAccount', id);
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
		}
		return v;
	});
}

export function delAccount(id: string): void {
	accounts_config.update(v => v.filter(a => a.id !== id));
}

export function findAccountConfig(id: string): IAccountConfig | undefined {
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
	if (!account.settings || typeof account.settings !== 'object' || Array.isArray(account.settings)) {
		errors.push('Account must have settings object');
	} else {
		/* Nested objects are a supported shape (grouped settings such as `notifications.enabled`), so
		 * the check walks the whole tree instead of demanding primitives at the top level. */
		collectForbiddenSettingsKeys(account.settings, '', errors, 0);
		const title = account.settings['title'];
		if (title !== undefined && typeof title !== 'string') errors.push('Settings "title" must be a string');
	}

	return { valid: errors.length === 0, errors };
}

/* Keys that would reach Object.prototype through a plain assignment. JSON.parse creates them as own
 * properties, so they survive validation unless rejected explicitly. */
const FORBIDDEN_SETTINGS_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

/** How deep a settings tree may nest before it is refused. */
const MAX_SETTINGS_DEPTH = 8;

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reports every prototype-polluting key anywhere in a settings tree. */
function collectForbiddenSettingsKeys(value: unknown, path: string, errors: string[], depth: number): void {
	if (depth > MAX_SETTINGS_DEPTH) {
		errors.push(`Settings are nested too deeply${path ? ` at "${path}"` : ''}`);
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, i) => collectForbiddenSettingsKeys(item, `${path}[${i}]`, errors, depth + 1));
		return;
	}
	if (!isPlainObject(value)) return;
	for (const key of Object.keys(value)) {
		const childPath = path ? `${path}.${key}` : key;
		if (FORBIDDEN_SETTINGS_KEYS.has(key)) {
			errors.push(`Settings key "${childPath}" is not allowed`);
			continue;
		}
		collectForbiddenSettingsKeys(value[key], childPath, errors, depth + 1);
	}
}

/** Rebuilds a settings value with null-prototype objects and without polluting keys. */
function sanitizeSettingsValue(value: unknown, depth: number): unknown {
	if (depth > MAX_SETTINGS_DEPTH) return undefined;
	if (Array.isArray(value)) return value.map(item => sanitizeSettingsValue(item, depth + 1)).filter(item => item !== undefined);
	if (!isPlainObject(value)) return value;
	const out: Record<string, unknown> = Object.create(null);
	for (const [key, child] of Object.entries(value)) {
		if (FORBIDDEN_SETTINGS_KEYS.has(key)) continue;
		const sanitized = sanitizeSettingsValue(child, depth + 1);
		if (sanitized !== undefined) out[key] = sanitized;
	}
	return out;
}

/** Rebuilds an imported account into a fresh object, dropping anything not part of the config shape. */
export function sanitizeAccountConfig(account: any): IAccountConfig {
	const settings = sanitizeSettingsValue(account?.settings ?? {}, 0) as IAccountSettings;
	return {
		id: account.id,
		enabled: account.enabled,
		credentials: {
			server: account.credentials.server,
			address: account.credentials.address,
			password: account.credentials.password,
			...(account.credentials.retry_nonce !== undefined ? { retry_nonce: account.credentials.retry_nonce } : {}),
		},
		settings,
	};
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
