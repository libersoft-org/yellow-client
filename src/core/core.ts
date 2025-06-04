//import {} from './client_debug';
import { tick } from 'svelte';
import { derived, get, type Readable, type Writable } from 'svelte/store';
import { log } from './tauri.ts';

// Import all stores
export * from './stores.ts';

// Import account functionality
import { accounts_init, accounts, active_account_store, active_account, selectAccount, active_account_module_data, findAccount } from './accounts.ts';
export { accounts, active_account_store, active_account, selectAccount, active_account_module_data, findAccount };

// Import accounts config
import { accounts_config, accounts_config_init, findAccountConfig, accountConfigExistsByCredentials } from './accounts_config.ts';
export { accounts_config, findAccountConfig, accountConfigExistsByCredentials };
export const accountConfigExistsById = (id: string): boolean => !!findAccountConfig(id);

// Import utils
import { getGuid } from './utils/utils.ts';
export { getGuid };

// Import module functionality
import { initModules, registerModule } from './modules.ts';
export { registerModule };

// Import socket functionality
import { send, sendAsync } from './socket.ts';
export { send, sendAsync };

export function init(): () => void {
	let subs = initModules();
	subs.push(accounts_init());
	subs.push(accounts_config_init());

	// return an unsubscriber
	return () => {
		for (const sub of subs) {
			sub();
		}
	};
}

interface RelayStore<T> extends Readable<T | null> {
	set: (value: T) => void;
	update: (fn: (value: T) => T) => void;
}

export function relay<T>(md: Readable<any>, key: string): RelayStore<T> {
	let r = derived(md, ($md, set) => {
		if (!$md) {
			set(null);
			return;
		}
		const unsubscribe = $md[key].subscribe((value: T) => {
			set(value);
		});

		return () => {
			unsubscribe();
		};
	}) as RelayStore<T>;

	r.set = (v: T) => {
		//console.log('SET:', get(md), 'key:',  key,  'v:', v);
		get(md)[key].set(v);
	};
	r.update = (fn: (value: T) => T) => {
		get(md)[key].update(fn);
	};
	return r;
}

// Default export for backward compatibility
export default {
	active_account_module_data,
	relay,
};
