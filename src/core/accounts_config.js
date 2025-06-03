import { get } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { log } from '@/core/tauri.ts';
import { selectAccount } from './accounts.ts';
import { getGuid } from './utils/utils.ts';

export const accounts_config = localStorageSharedStore('accounts_config', import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS ? JSON.parse(import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS) : []);

export function addAccount(config, settings) {
	console.log('addAccount(config, settings)', config, settings);
	let id = getGuid();
	accounts_config.update(v => [
		...v,
		{
			id,
			...config,
			settings,
		},
	]);
	selectAccount(id);
	return id;
}

export function saveAccount(id, config, settings) {
	console.log('saveAccount', id, config, settings);
	accounts_config.update(v => {
		for (let acc of v) {
			if (acc.id === id) {
				for (const [key, value] of Object.entries(config)) {
					acc[key] = value;
				}
				for (const [key, value] of Object.entries(settings)) {
					if (acc.settings === undefined) acc.settings = {};
					acc.settings[key] = value;
				}
			}
			console.log('saveAccount acc config:', JSON.stringify(acc));
		}
		return v;
	});
}

export function delAccount(id) {
	accounts_config.update(v => v.filter(a => a.id !== id));
}

export function findAccountConfig(id) {
	return get(accounts_config).find(a => a.id === id);
}

export function accountConfigExistsByCredentials(server, address) {
	const currentConfig = get(accounts_config);
	const identifier = `${server}\\\\${address}`;
	return currentConfig.some(account => {
		const accountServer = account.credentials?.server || account.server;
		const accountAddress = account.credentials?.address || account.address;
		return `${accountServer}\\\\${accountAddress}` === identifier;
	});
}

export function toggleAccountEnabled(id) {
	log.debug('TOGGLE ACCOUNT ENABLED accounts_config', accounts_config);
	log.debug('TOGGLE ACCOUNT ENABLED id', id);
	accounts_config.update(v =>
		v.map(a => {
			if (a.id === id) a.enabled = !a.enabled;
			return a;
		})
	);
}
