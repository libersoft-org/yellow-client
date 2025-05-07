import { tick } from 'svelte';
import { derived, get, writable } from 'svelte/store';
import { localStorageReadOnceSharedStore, localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { log } from './tauri.ts';

//import {} from './client_debug';

export const debugBuffer = writable('');
export const documentHeight = writable(0);
export const isMobile = writable(false);
export const keyboardHeight = writable(0);
export const hideSidebarMobile = writable(false);
export let isClientFocused = writable(true);
export let selected_corepage_id = writable(null);
export let selected_module_id = writable(null);

export let modules_order = localStorageSharedStore('modules_order', {});
export let modules_disabled = localStorageSharedStore('modules_disabled', []);
export let debug = writable(import.meta.env.VITE_CLIENT_DEBUG || false);

export const product = 'Yellow';
export const motto = 'Experience the freedom of decentralized world';
export const version = '0.0.1';
export const build =
 typeof __BUILD_DATE__ !== 'undefined'
  ? new Date(__BUILD_DATE__)
     .toISOString()
     .replace('T', ' ')
     .replace(/\.\d+Z/, '')
  : 'unknown';
export const commit = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'unknown';
export const link = 'https://yellow.libersoft.org';

// declarations of modules that this client supports
export let module_decls = writable({});

const ping_interval = import.meta.env.VITE_YELLOW_CLIENT_PING_INTERVAL || 10000;

export function init() {
 let subs = [];

 subs.push(
  selected_module_id.subscribe(async id => {
   await tick();
   let module_decls_v = get(module_decls);
   for (const k in module_decls_v) {
    const module = module_decls_v[k];
    module.callbacks.onModuleSelected?.(id === module.id);
   }
  })
 );

 subs.push(
  modules_order.subscribe(value => {
   //console.log('MODULES ORDER:', value);
   let module_decls_v = get(module_decls);
   for (const k in module_decls_v) {
    const decl = module_decls_v[k];
    if (value[decl.id] !== undefined) {
     decl.order = value[decl.id];
    }
   }
   module_decls.set(module_decls_v);
  })
 );

 subs.push(
  accounts_config.subscribe(value => {
   log.debug('ACCOUNTS CONFIG:', value);
   void 'TODO: implement configuration of accounts order';
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
  })
 );

 return () => {
  for (const sub of subs) {
   sub();
  }
 };
}

export function registerModule(id, decl) {
 console.log('REGISTER MODULE:', id, decl);
 if (get(modules_disabled).indexOf(id) !== -1) {
  console.log('Module disabled:', id);
  return;
 }
 let ordering = get(modules_order);
 if (ordering[id] !== undefined) {
  decl.order = ordering[id];
 }
 decl.id = id;
 let module_decls_v = get(module_decls);
 module_decls_v[id] = decl;
 module_decls.set(module_decls_v);
 decl.deinit = decl.callbacks?.init?.();
}

export const active_account_id = localStorageReadOnceSharedStore('active_account_id', null);

export const accounts_config = localStorageSharedStore('accounts_config', import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS ? JSON.parse(import.meta.env.VITE_YELLOW_CLIENT_DEFAULT_ACCOUNTS) : []);

export let accounts = writable([]);

import.meta.hot?.dispose(() => {
 get(accounts).forEach(acc => {
  reconnectAccount(acc);
 });
});

export function findAccount(id) {
 return get(accounts).find(account => get(account).id === id);
}

/* fire off whenever accounts array or active_account_id changes */
export let active_account_store = derived([accounts, active_account_id], ([$accounts, $active_account_id]) => {
 //console.log('active_account_store:', $accounts, $active_account_id);
 let r = $accounts.find(acc => get(acc).id === $active_account_id);
 //console.log('active_account_store:', r);
 return r;
});

// Create a derived store that depends on active_account_store and its nested account store. The contents is the account object.
export let active_account = derived(active_account_store, ($active_account_store, set) => {
 if (!$active_account_store) {
  return set(null);
 }
 // subscribe to the store that contains the account object
 const unsubscribe = $active_account_store.subscribe(account => {
  //console.log('DERIVED NESTED STORE:', account);
  set(account);
 });
 return () => unsubscribe();
});

export function active_account_module_data(module_id) {
 return derived(active_account, $active_account => {
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

export function relay(md, key) {
 let r = derived(md, ($md, set) => {
  if (!$md) {
   set(null);
   return;
  }
  const unsubscribe = $md[key].subscribe(value => {
   set(value);
  });

  return () => {
   unsubscribe();
  };
 });
 r.set = v => {
  //console.log('SET:', get(md), 'key:',  key,  'v:', v);
  get(md)[key].set(v);
 };
 r.update = fn => {
  get(md)[key].update(fn);
 };
 return r;
}

function updateLiveAccount(account, config) {
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

function createLiveAccount(config) {
 // add new account
 let account = constructAccount(config.id, config.credentials, config.enabled, config.settings);
 //console.log('NEW account', get(account));
 accounts.update(v => [...v, account]);
 if (config.enabled) _enableAccount(account);
 else _disableAccount(account);
}

function removeLiveAccountsNotInConfig(accounts_list, value) {
 // remove accounts that are not in config
 for (let account of accounts_list) {
  if (!value.find(conf => conf.id === get(account).id)) {
   console.log('REMOVE ACCOUNT', get(account));
   _disableAccount(account);
   accounts.update(v => v.filter(a => get(a).id !== get(account).id));
  }
 }
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

export function selectAccount(id) {
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
  if (get(active_account).module_data[old_selected_module]) selected_module_id.set(old_selected_module);
 });
}

function onAvailableModulesChanged(acc) {
 updateModulesComms(acc);
}

function constructAccount(id, credentials, enabled, settings) {
 log.debug('CONSTRUCT ACCOUNT', id, credentials, enabled, settings);
 let acc = {
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

function _enableAccount(account) {
 let acc = get(account);
 acc.enabled = true;
 acc.suspended = false;
 acc.status = 'Enabled.';
 (acc.events = new EventTarget()),
  /* todo: unsubscribe on disable */
  acc.events.addEventListener('modules_available', event => {
   for (const k in event.detail?.data?.modules_available) {
    acc.available_modules[k] = event.detail.data.modules_available[k];
   }
   log.debug('available_modules:', acc.available_modules);
   onAvailableModulesChanged(acc);
   account.update(v => v);
  });

 account.update(v => v);
 // TODO: use admin logic
 reconnectAccount(account);
}

function _disableAccount(account) {
 log.debug('DISABLE ACCOUNT', account);
 let acc = get(account);
 clearAccount(acc);
 clearPingTimer(acc);
 clearReconnectTimer(account);
 acc.enabled = false;
 acc.suspended = false;
 acc.status = 'Disabled.';
 account.update(v => v);
}

function reconnectAccount(account) {
 log.debug('RECONNECT ACCOUNT', account);
 let acc = get(account);
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
   const msg = e.message;
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
   acc.error = 'Network error: ' + event.message;
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

function retry(account, msg) {
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

function setReconnectTimer(account) {
 let acc = get(account);

 if (acc.reconnectTimer != null) {
  clearInterval(acc.reconnectTimer);
 }
 acc.reconnectTimer = setTimeout(() => {
  reconnectAccount(account);
 }, 1000);
}

function clearReconnectTimer(account) {
 let acc = get(account);

 if (acc.reconnectTimer) {
  clearTimeout(acc.reconnectTimer);
  acc.reconnectTimer = null;
 }
}

function clearPingTimer(acc) {
 if (acc.pingTimer) {
  clearInterval(acc.pingTimer);
  acc.pingTimer = null;
 }
}

function sendLoginCommand(account) {
 log.debug('Sending login command');
 let acc = get(account);
 send(acc, account, 'core', 'user_login', { address: acc.credentials.address, password: acc.credentials.password }, false, (req, res) => {
  log.debug('Login response:', res);
  if (res.error !== false) {
   acc.error = res.message;
   acc.status = 'Login failed.';
   acc.session_status = undefined;
   acc.suspended = true;
   console.error('Login failed:', res);
  } else {
   acc.session_status = 'Logged in.';
   console.log('Logged in:', res);
   acc.error = null;
   acc.sessionID = res.data.sessionID;
   acc.wsGuid = res.data.wsGuid;
   acc.available_modules = res.data.modules_available;
   onAvailableModulesChanged(acc);
   saveOriginalWsGuid(acc);
  }
  account.update(v => v);
 });
}

function saveOriginalWsGuid(acc) {
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

function setupPing(account) {
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
   acc.bufferedAmount = acc.socket.bufferedAmount;
   account.update(v => v);
  }
 }, 500);

 acc.pingTimer = window.setInterval(() => {
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
    console.log('Ping response:', res);
    acc.lastCommsTs = Date.now();
    //console.log('lastCommsTs:', acc.lastCommsTs);
    void 'avoid expensive UI update';
    if (acc.status !== 'Connected.' || acc.error != null) {
     acc.status = 'Connected.';
     acc.error = null;
     account.update(v => v);
    }
   },
   false
  );
  let noCommsSeconds = Date.now() - acc.lastCommsTs;
  if (noCommsSeconds > 60000 + (Date.now() - acc.lastTransmissionTs)) {
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

function initModuleComms(acc, module_id, decl) {
 console.log('initModuleComms:', decl);
 if (!acc.module_data[module_id]) {
  if (decl.callbacks.initData) acc.module_data[module_id] = decl.callbacks?.initData(acc);
  else acc.module_data[module_id] = {};
  acc.module_data[module_id].id = decl.id;
  acc.module_data[module_id].decl = decl;
 }
 if (decl.callbacks.initComms) decl.callbacks.initComms(acc);
}

function deinitModuleComms(decl, acc) {
 acc.module_data[decl.id].online?.set(false);
 if (decl.callbacks.deinitComms) decl.callbacks.deinitComms(acc);
}

function updateModulesComms(acc) {
 let available_modules = acc.available_modules;

 let module_decls_v = get(module_decls);
 for (const module_id in module_decls_v) {
  const available = available_modules[module_id];
  const online = acc.module_data[module_id]?.online && get(acc.module_data[module_id].online);

  const decl = module_decls_v[module_id];
  if (!decl) {
   console.log('Module available on server but not found on client:', module_id);
  } else {
   if (available && online) {
    console.log('available module already set online:', module_id);
   } else if (available && !online) {
    initModuleComms(acc, module_id, decl);
    acc.module_data[module_id].online?.set(true);
   } else if (!available && online) {
    deinitModuleComms(acc.module_data[module_id].decl, acc);
    acc.module_data[module_id].online?.set(false);
   } else if (!available && !online) {
    //console.log('Module not available but also not initialized:', module_id);
   }
  }
 }
}

function disconnectAccount(acc) {
 acc.requests = {};
 acc.available_modules = {};
 onAvailableModulesChanged(acc);

 if (acc.socket) {
  acc.socket.close();
  acc.socket = null;
 }

 console.log('Account disconnected');
}

function clearAccount(acc) {
 disconnectAccount(acc);
 acc.requests = {};
 acc.module_data = {};
}

function handleSocketMessage(acc, res) {
 //console.log('MESSAGE FROM SERVER', res);
 if (res.requestID) {
  // it is response to command:
  //console.log('GOT RESPONSE');
  const reqData = acc.requests[res.requestID];
  if (reqData.callback) reqData.callback(reqData.req, res);
  delete acc.requests[res.requestID];
 } else if (res.event) {
  //console.log('EVENT:', res);
  acc.events.dispatchEvent(new CustomEvent(res.event, { detail: res }));
 } else console.log('Unknown command from server:', res);
}

export function getGuid(length = 40) {
 let result = '';
 while (result.length < length) result += Math.random().toString(36);
 return result;
}

export function sendAsync(acc, account, target, command, params = {}, sendSessionID = true, quiet = false) {
 return new Promise((resolve, reject) => {
  send(acc, account, target, command, params, sendSessionID, (req, res) => {
   resolve(res);
  });
 });
}

export function send(acc, account, target, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
 /*
 acc: account object
 account: account store, optional, for debugging
  */
 if (!acc) {
  console.error('Error while sending command: account is not defined');
  return;
 }
 if (!acc.socket || acc.socket.readyState !== WebSocket.OPEN) {
  console.error('Error while sending command: WebSocket is not open');
  return;
 }
 const requestID = generateRequestID();

 const req = {
  target: target,
  requestID,
 };

 if (sendSessionID) req.sessionID = acc.sessionID;
 if (command || params) req.data = {};
 if (command) req.data.command = command;
 if (params) req.data.params = params;

 //console.log('SENDING COMMAND:', req);

 acc.requests[requestID] = {
  req,
  callback: (req, res) => {
   if (res.error) console.error(res);
   if (callback) callback(req, res);
  },
 };

 /* if (!quiet) {
  console.log('------------------');
  console.log('SENDING COMMAND:');*/
 console.log(req);
 /*console.log('------------------');
 }*/

 acc.socket.send(JSON.stringify(req));
 acc.lastTransmissionTs = Date.now();
 acc.bufferedAmount = acc.socket.bufferedAmount;
 //console.log('bufferedAmount:', acc.bufferedAmount);

 return requestID;
}

let lastRequestId = 0;

function generateRequestID() {
 return ++lastRequestId;
}

// import inspect from 'browser-util-inspect';
function formatNoColor(args) {
 let msg = '';
 const inspected_nocolor = args.map(o => (typeof o === 'string' ? o : o));
 for (const v of inspected_nocolor) msg += v + ' ';
 return msg;
}

let originalLog;

function monkeypatch_console_log() {
 if (originalLog) return;
 if (window.console_log_monkeypatched) return;
 window.console_log_monkeypatched = true;
 originalLog = console.log;
 console.log = function (...args) {
  //const timestamp = new Date().toISOString();
  // show just time:
  const timestamp = new Date().toISOString().slice(11, -1);
  let msg = [`[${timestamp}]`, ...args];
  originalLog.apply(console, msg);
  debugBuffer.update(v => v + formatNoColor(msg) + '\n');
 };
}

//monkeypatch_console_log();

export default { hideSidebarMobile, isClientFocused, accounts };
