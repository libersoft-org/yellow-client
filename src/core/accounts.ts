import { log, TAURI_MOBILE, TAURI_SERVICE } from '@/core/tauri.ts';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { derived, get, writable } from 'svelte/store';
import { debug, selected_module_id, active_account_id } from '@/core/stores.ts';
import { send, handleSocketMessage } from '@/core/socket.ts';
import { updateModulesComms } from '@/core/modules.ts';
import { accounts_config } from '@/core/accounts_config.ts';
import { tick } from 'svelte';
import type { Account, AccountStore, AccountConfig, AccountCredentials, AccountSettings } from './types.ts';
const ping_interval = import.meta.env.VITE_YELLOW_CLIENT_PING_INTERVAL || 10000;
export let accounts = writable<AccountStore[]>([]);
/* fire off whenever accounts array or active_account_id changes */
export let active_account_store = derived([accounts, active_account_id], ([$accounts, $active_account_id]: [AccountStore[], string | null]) => {
	//console.log('active_account_store:', $accounts, $active_account_id);
	let r = $accounts.find((acc: AccountStore) => get(acc).id === $active_account_id);
	//console.log('active_account_store:', r);
	return r;
});

// Create a derived store that depends on active_account_store and its nested account store. The contents is the account object.
export let active_account = derived(active_account_store, ($active_account_store: AccountStore | undefined, set: (value: Account | null) => void) => {
	if (!$active_account_store) return set(null);
	// subscribe to the store that contains the account object
	const unsubscribe = $active_account_store.subscribe((account: Account) => {
		//console.log('DERIVED NESTED STORE:', account);
		set(account);
	});
	return () => unsubscribe();
});

export function selectAccount(id: string) {
	log.debug('SELECT ACCOUNT', id);
	if (get(active_account_id) === id) return;
	/* here we temporarily set selected_module_id to null, so that the module components are forced to be destroyed and re-created, so that they can re-initialize their data.
	 * This allows for modules to not be perfectly reactive. */
	let old_selected_module = get(selected_module_id);
	selected_module_id.set(null);
	if (!findAccount(id)) {
		log.debug('account not found');
		return;
	}
	active_account_id.set(id);
	tick().then(() => {
		const activeAcc = get(active_account);
		if (old_selected_module && activeAcc?.module_data[old_selected_module]) selected_module_id.set(old_selected_module);
	});
}

export function active_account_module_data(module_id: string) {
	return derived(active_account, ($active_account: Account | null) => {
		if (!$active_account) {
			console.log('no active account => no module data.');
			return null;
		}
		//console.log('$active_account:', $active_account, 'MODULE ID:', module_id);
		let result = $active_account.module_data[module_id];
		//console.log('MODULE DATA:', result);
		return result;
	});
}

import.meta.hot?.dispose(() => {
	get(accounts).forEach(acc => {
		reconnectAccount(acc);
	});
});

export function accounts_init() {
	return accounts_config.subscribe(value => {
		log.debug('ACCOUNTS CONFIG:', value);
		// TODO: implement configuration of accounts order
		let accounts_list = get(accounts);
		log.debug('EXISTING ACCOUNTS (stores):', accounts_list);
		for (let config of value) {
			log.debug('CONFIG', config);
			let account = accounts_list.find(acc => get(acc).id === config.id);
			if (account) {
				//log.debug('UPDATE ACCOUNT', JSON.stringify(get(account), null, 2));
				updateLiveAccount(account, config);
			} else {
				log.debug('CREATE ACCOUNT', config);
				createLiveAccount(config);
			}
		}
		removeLiveAccountsNotInConfig(accounts_list, value);
	});

	// Set up native message listener for service-based connections
	if (TAURI_SERVICE) {
		setupNativeMessageListener();
	}
}

export function findAccount(id: string) {
	return get(accounts).find((account: AccountStore) => get(account).id === id);
}

function updateLiveAccount(account: AccountStore, config: AccountConfig) {
	let acc = get(account);
	//console.log('updateLiveAccount', acc, config);
	if (acc.credentials.retry_nonce != config.credentials.retry_nonce) {
		log.debug('retry_nonce changed:', acc.credentials.retry_nonce, config.credentials.retry_nonce);
	}
	if (acc.credentials.retry_nonce != config.credentials.retry_nonce || acc.credentials.server != config.credentials.server || acc.credentials.address != config.credentials.address || acc.credentials.password != config.credentials.password) {
		acc.credentials = config.credentials;
		log.debug('credentials changed:', acc.credentials);
		if (acc.enabled) {
			_disableAccount(account);
			_enableAccount(account);
		}
	}
	if (acc.enabled != config.enabled) {
		if (config.enabled) {
			log.debug('enabling account:', acc.id);
			_enableAccount(account);
		} else {
			log.debug('disabling account:', acc.id);
			_disableAccount(account);
		}
	}
	let settings_updated = false;
	for (const [key, value] of Object.entries(config.settings)) {
		//console.log('config:', key, value);
		if (acc.settings[key] != value) {
			acc.settings[key] = value;
			settings_updated = true;
			//console.log('settings updated:', key, value);
		} else {
			//console.log('settings not updated:', key, value);
		}
	}
	if (settings_updated) {
		log.debug('settings updated:', acc.settings);
		account.update(v => v);
	}
}

function createLiveAccount(config: AccountConfig) {
	// add new account
	let account = constructAccount(config.id, config.credentials, config.enabled, config.settings);
	//console.log('NEW account', get(account));
	accounts.update(v => [...v, account]);
	if (config.enabled) _enableAccount(account);
	else _disableAccount(account);
}

function removeLiveAccountsNotInConfig(accounts_list: AccountStore[], value: AccountConfig[]) {
	// remove accounts that are not in config
	for (let account of accounts_list) {
		if (!value.find(conf => conf.id === get(account).id)) {
			console.log('REMOVE ACCOUNT', get(account));
			_disableAccount(account);
			accounts.update(v => v.filter(a => get(a).id !== get(account).id));
		}
	}
}

function constructAccount(id: string, credentials: AccountCredentials, enabled: boolean, settings: AccountSettings): AccountStore {
	log.debug('CONSTRUCT ACCOUNT', id, credentials, enabled, settings);
	let acc: Account = {
		id,
		socket_id: 0,
		settings: { ...settings },
		credentials: { ...credentials },
		enabled,
		/*
    also stuff like (set on ping, for example) belongs here:  lastCommsTs, status, error
    We should put all this stuff in a separate object, let's say "info".
    And try to stuff credentials into settings maybe.
    And each of these nested objects of interest can be a store, so we can update them independently, without causing a global update on each ping.
  */
		requests: {},
		module_data: {},
		available_modules: {},
	};
	let account = writable(acc);
	return account;
}

function handleModulesAvailable(acc: Account, account: AccountStore, event: Event) {
	const customEvent = event as CustomEvent;
	for (const k in customEvent.detail?.data?.modules_available) {
		acc.available_modules[k] = customEvent.detail.data.modules_available[k];
	}
	log.debug('available_modules:', acc.available_modules);
	updateModulesComms(acc);
	account.update(v => v);
}

function _enableAccount(account: AccountStore) {
	let acc = get(account);
	acc.enabled = true;
	acc.suspended = false;
	acc.status = 'Enabled.';
	acc.events = new EventTarget();
	// Create bound handler for this account
	acc.modulesAvailableHandler = (event: Event) => handleModulesAvailable(acc, account, event);
	acc.events.addEventListener('modules_available', acc.modulesAvailableHandler);

	if (!TAURI_SERVICE) {
		// Add session error handler
		acc.sessionErrorHandler = (event: Event) => {
			const customEvent = event as CustomEvent;
			log.debug('Session error event received:', customEvent.detail);
			acc.error = customEvent.detail.message;
			acc.status = 'Session invalid, reconnecting...';
			acc.session_status = undefined;
			acc.sessionID = undefined;
			account.update(v => v);
			// Trigger reconnection
			reconnectAccount(account);
		};
		acc.events.addEventListener('session_error', acc.sessionErrorHandler);
	}

	account.update(v => v);
	// TODO: use admin logic
	reconnectAccount(account);
}

function _disableAccount(account: AccountStore) {
	log.debug('DISABLE ACCOUNT', account);
	let acc = get(account);
	// Remove event listeners if they exist
	if (acc.events) {
		if (acc.modulesAvailableHandler) {
			acc.events.removeEventListener('modules_available', acc.modulesAvailableHandler);
			acc.modulesAvailableHandler = undefined;
		}
		if (acc.sessionErrorHandler) {
			acc.events.removeEventListener('session_error', acc.sessionErrorHandler);
			acc.sessionErrorHandler = undefined;
		}
	}
	clearAccount(acc);
	clearPingTimer(acc);
	clearReconnectTimer(account);
	acc.enabled = false;
	acc.suspended = false;
	acc.status = 'Disabled.';
	account.update(v => v);
}

function reconnectAccount(account: AccountStore) {
	if (TAURI_SERVICE) {
		return;
	}

	let acc = get(account);
	log.debug('RECONNECT ACCOUNT', acc);
	if (!acc.enabled) return;
	if (acc.suspended) {
		log.debug('account suspended. not reconnecting.');
		return;
	}
	if (acc.status != 'Enabled.' && acc.status != 'Retrying...') {
		log.debug('Account status not "Enabled." or "Retrying...", not reconnecting:', acc.status);
		return;
	}
	//clearPingTimer(acc);
	clearReconnectTimer(account);

	disconnectAccount(acc);
	let socket_id;
	log.debug('acc.socket.readyState:', acc.socket?.readyState);
	if (!acc.socket || acc.socket.readyState === WebSocket.CLOSED || acc.socket.readyState === WebSocket.CONNECTING || acc.socket.readyState === WebSocket.CLOSING || acc.socket.url !== acc.credentials.server) {
		if (acc.socket) {
			if (acc.socket.readyState !== WebSocket.CLOSED) {
				// throw away the old socket, it will be unused from now on
				acc.socket.onopen = event => log.debug('old socket onopen', event);
				acc.socket.onerror = event => log.debug('old socket onerror', event);
				acc.socket.onclose = event => log.debug('old socket onclose', event);
				acc.socket.onmessage = event => log.debug('old socket onmessage', event);
				acc.socket.close();
			}
		}
		socket_id = ++acc.socket_id;
		log.debug('Creating new WebSocket:', acc.credentials.server);
		acc.status = 'Connecting...';
		acc.lastCommsTs = Date.now();
		acc.lastTransmissionTs = Date.now();
		account.update(v => v);
		try {
			acc.socket = new WebSocket(acc.credentials.server);
		} catch (e) {
			const msg = (e as Error).message;
			acc.error = msg;
			acc.suspended = true;
			acc.status = 'Error.';
			log.debug('acc.status:', acc.status);
			account.update(v => v);
			return;
		}
		acc.socket.onmessage = event => {
			if (acc.socket_id !== socket_id) {
				log.debug('Socket ID changed, ignoring message:', event);
				return;
			}
			handleSocketMessage(acc, JSON.parse(event.data));
		};

		acc.socket.onopen = event => {
			if (acc.socket_id !== socket_id) {
				log.debug('Socket ID changed, ignoring open event:', event);
				return;
			}
			log.debug('Connected to WebSocket ' + socket_id + ':', event);
			acc.status = 'Connected, logging in...';
			log.debug('acc.status:', acc.status);
			acc.lastCommsTs = Date.now();
			account.update(v => v);
			sendLoginCommand(account);
		};
		acc.socket.onerror = event => {
			if (acc.socket_id !== socket_id) {
				log.debug('Socket ID changed, ignoring error event:', event);
				return;
			}
			log.debug('WebSocket ' + socket_id + ' error:', event);
			retry(account, 'Connection error');
			acc.error = 'Network error: ' + (event as any).message;
			acc.session_status = undefined;
			account.update(v => v);
		};
		acc.socket.onclose = event => {
			if (acc.socket_id !== socket_id) {
				log.debug('Socket ID changed, ignoring close event:', event);
				return;
			}
			log.debug('WebSocket ' + socket_id + '  closed:', event, 'wasClean:', event.wasClean, 'reason:', event.reason, 'code:', event.code);
			acc.session_status = undefined;
			account.update(v => v);
			setTimeout(() => {
				log.debug('onclose retry');
				retry(account, 'Connection closed');
			}, 200);
		};
		clearPingTimer(acc);
		setupPing(account);
	}
}

function retry(account: AccountStore, msg: string) {
	let acc = get(account);
	log.debug('RETRY ACCOUNT', acc);
	if (!acc.enabled || acc.suspended) return;
	if (acc.status === 'Retrying...') {
		log.debug('Already retrying.');
		return;
	}
	acc.status = 'Retrying...';
	log.debug(acc.status);
	acc.session_status = undefined;
	acc.error = msg;
	//clearPingTimer(acc);
	//acc.sessionID = null;
	account.update(v => v);
	log.debug('Retrying ...');
	setReconnectTimer(account);
}

function setReconnectTimer(account: AccountStore) {
	let acc = get(account);
	if (acc.reconnectTimer) clearInterval(acc.reconnectTimer);
	acc.reconnectTimer = setTimeout(() => {
		reconnectAccount(account);
	}, 1000);
}

function clearReconnectTimer(account: AccountStore) {
	let acc = get(account);
	if (acc.reconnectTimer) {
		clearTimeout(acc.reconnectTimer);
		acc.reconnectTimer = undefined;
	}
}

function clearPingTimer(acc: Account) {
	if (acc.pingTimer) {
		clearInterval(acc.pingTimer);
		acc.pingTimer = undefined;
	}
}

function sendLoginCommand(account: AccountStore) {
	log.debug('Sending login command');
	let acc = get(account);
	send(acc, account, 'core', 'user_login', { address: acc.credentials.address, password: acc.credentials.password }, false, (req, res) => {
		log.debug('Login response:', res);
		if (res.error !== false) {
			acc.error = res.message;
			acc.status = 'Login failed.';
			acc.session_status = undefined;
			acc.suspended = true;
			console.debug('Login failed:', res);
		} else {
			acc.session_status = 'Logged in.';
			console.log('Logged in:', res);
			acc.error = null;
			acc.sessionID = res.data.sessionID;
			acc.wsGuid = res.data.wsGuid;
			acc.available_modules = res.data.modules_available;
			updateModulesComms(acc).catch(err => console.error('Failed to update module comms:', err));
			saveOriginalWsGuid(acc);
		}
		account.update(v => v);
	});
}

function saveOriginalWsGuid(acc: Account) {
	/* acc.original_wsGuid can be used to detect if a tab with an upload has been reloaded. Upload has to be paired with client wsGuid first. Module can then send a notification that asks clients with the original wsGuid if the file is still available. */
	let sess = window.sessionStorage;
	let json = sess.getItem('sessions') || '{}';
	let sessions = JSON.parse(json);
	let original_wsGuid = sessions[acc.credentials.server]?.[acc.credentials.address];
	if (!original_wsGuid) {
		if (!sessions[acc.credentials.server]) sessions[acc.credentials.server] = {};
		sessions[acc.credentials.server][acc.credentials.address] = acc.wsGuid;
		sess.setItem('sessions', JSON.stringify(sessions));
	}
	acc.original_wsGuid = original_wsGuid;
}

function setupPing(account: AccountStore) {
	let acc = get(account);
	/*window.setInterval(() => {
  send(
   acc,
   'core',
   'ping',
   {},
   true,
   (req, res) => {
    console.log('Ping response:', res);
    acc.lastCommsTs = Date.now();
    acc.status = 'Connected.';
    acc.error = null;
    account.update(v => v);
   },
   true
  );
 }, 500);*/
	setInterval(() => {
		if (get(debug)) {
			if (acc.socket) acc.bufferedAmount = acc.socket.bufferedAmount;
			account.update(v => v);
		}
	}, 500);
	acc.pingTimer = setInterval(() => {
		if (!acc.socket || acc.socket.readyState !== WebSocket.OPEN) {
			acc.status = 'Retrying...';
			acc.error = 'Not connected';
			acc.session_status = undefined;
			log.debug('Socket not open, retrying...');
			account.update(v => v);
			reconnectAccount(account);
			return;
		}
		send(
			acc,
			account,
			'core',
			'ping',
			{},
			true,
			(req, res) => {
				//console.log('Ping response:', res);
				acc.lastCommsTs = Date.now();
				//console.log('lastCommsTs:', acc.lastCommsTs);
				//TODO: avoid expensive UI update
				/*if (acc.status !== 'Connected.' || acc.error != null) {
					acc.status = 'Connected.';
					acc.error = null;
					account.update(v => v);
				}*/
			},
			false
		);
		let noCommsSeconds = acc.lastCommsTs ? Date.now() - acc.lastCommsTs : Infinity;
		if (acc.lastTransmissionTs && noCommsSeconds > 60000 + (Date.now() - acc.lastTransmissionTs)) {
			const msg = 'No comms for ' + noCommsSeconds / 1000 + ' seconds, reconnecting...';
			log.debug(msg);
			// not sure if we want to use retry() here, not sure if we can trust the browser not to fire off any more message events even if we close()'d the socket, so let's wait all the way until we call reconnectAccount()
			acc.status = 'Retrying...';
			acc.error = msg;
			//clearPingTimer(acc);
			//acc.sessionID = null;
			account.update(v => v);
			reconnectAccount(account);
		}
	}, ping_interval);
}

function disconnectAccount(acc: Account) {
	acc.requests = {};
	acc.available_modules = {};
	updateModulesComms(acc);
	if (acc.socket) {
		acc.socket.close();
		acc.socket = undefined;
	}
	console.log('Account disconnected');
}

function clearAccount(acc: Account) {
	disconnectAccount(acc);
	acc.requests = {};
	acc.module_data = {};
}

// Mobile native message handling
async function setupNativeMessageListener() {
	log.debug('Setting up native message listener');

	try {
		// Listen for messages from native
		await listen('native-message', (event: any) => {
			const { accountId, message } = event.payload;
			log.debug('Received message from native:', accountId, message);

			// Find the account
			const accountStore = findAccount(accountId);
			if (!accountStore) {
				log.error('Account not found for native message:', accountId);
				return;
			}

			const acc = get(accountStore);

			// Handle the message through the normal socket message handler
			handleSocketMessage(acc, message);
		});

		// Listen for connection status updates
		await listen('native-connection-status', (event: any) => {
			const { accountId, status, error } = event.payload;
			log.debug('Native connection status update:', accountId, status);

			const accountStore = findAccount(accountId);
			if (!accountStore) {
				log.error('Account not found for status update:', accountId);
				return;
			}

			// Update account status
			accountStore.update(acc => {
				acc.status = status;
				acc.error = error || null;
				acc.lastCommsTs = Date.now();
				return acc;
			});
		});

		log.debug('Native message listener setup complete');
	} catch (error) {
		log.error('Failed to setup native message listener:', error);
	}
}
