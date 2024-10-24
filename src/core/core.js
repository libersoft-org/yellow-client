import { tick } from 'svelte';
import { get, writable, derived } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.js';

export const hideSidebarMobile = writable(false);
export let isClientFocused = writable(true);
export let selected_corepage_id = writable(null);
export let selected_module_id = writable(null);

// declarations of modules that this client supports
let module_decls = {};
let global_socket_id = 0;

const heartbeat_interval = 150000;

export function getModuleDecls() {
 //console.log('GET MODULE DECLS:', module_decls);
 return module_decls;
}

export function registerModule(id, decl) {
 //console.log('REGISTER MODULE:', id, decl);
 module_decls[id] = decl;
 decl.id = id;
}

const active_account_id = localStorageSharedStore('active_account_id', null);

let default_accounts = [];
if (import.meta.env.VITE_AMTP_SERVER_WS_URL) {
 default_accounts = [
  {
   id: 1,
   settings: {
    title: 'Account 1',
   },
   enabled: true,
   credentials: {
    server: import.meta.env.VITE_AMTP_SERVER_WS_URL || '',
    address: 'user@example.com',
    password: '123456789',
   },
  },
  {
   id: 2,
   settings: {
    title: 'Account 2',
   },
   enabled: true,
   credentials: {
    server: import.meta.env.VITE_AMTP_SERVER_WS_URL || '',
    address: 'user2@example2.com',
    password: '123456789',
   },
  },
  {
   id: 3,
   settings: {
    title: 'Account 3',
   },
   enabled: false,
   credentials: {
    server: import.meta.env.VITE_AMTP_SERVER_WS_URL || '',
    address: 'user3@example3.com',
    password: '123456789',
   },
  },
 ];
}

export const accounts_config = localStorageSharedStore('accounts_config', default_accounts);

export let accounts = writable([]);

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

active_account.subscribe(value => {
 //console.log('ACTIVE ACCOUNT:', value);
});

export function module_data_derived(module_id) {
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

/*
this store merges the streams of module_data changes (these happen when active account changes) and the data_name changes (these happen when something like messagesArray is updated)
to do: it should actually not depend on module_data_derived, but on a store that derives from module_data_derived and from selected_module_id.
this way, we should be able to ensure that the store updates *after* selectedModule changes.
module components would unmount before they'd see their messagesArray change to null.
As it is now, every module content and sideba component has to check for nulls.
*/
export function relay(md, data_name) {
 let r = derived(md, ($md, set) => {
  if (!$md) {
   set(null);
   return;
  }
  const unsubscribe = $md[data_name].subscribe(value => {
   set(value);
  });

  return () => {
   unsubscribe();
  };
 });
 r.set = v => {
  get(md)[data_name].set(v);
 };
 r.update = fn => {
  get(md)[data_name].update(fn);
 };
 return r;
}

accounts_config.subscribe(value => {
 //console.log('ACCOUNTS CONFIG:', value);
 //TODO: implement configuration of accounts order
 let accounts_list = get(accounts);
 //console.log('EXISTING ACCOUNTS (stores):', accounts_list);
 for (let config of value) {
  //console.log('CONFIG', config);
  let account = accounts_list.find(acc => get(acc).id === config.id);
  //console.log('account', account);
  if (account) {
   let acc = get(account);

   if (acc.credentials.server != config.credentials.server || acc.credentials.address != config.credentials.address || acc.credentials.password != config.credentials.password) {
    acc.credentials = config.credentials;
    if (acc.enabled) {
     _disableAccount(account);
     _enableAccount(account);
    }
   }

   if (acc.enabled != config.enabled) {
    if (config.enabled) _enableAccount(account);
    else _disableAccount(account);
    let settings_updated = false;
    for (const [key, value] of Object.entries(config.settings)) {
     if (acc.settings[key] != value) {
      acc.settings[key] = value;
      settings_updated = true;
     }
    }
    if (settings_updated) account.update(v => v);
   }
  } else {
   // add new account
   let account = constructAccount(config.id, config.credentials, config.enabled, config.settings);
   //console.log('NEW account', get(account));
   accounts.update(v => [...v, account]);
   if (config.enabled) _enableAccount(account);
   else _disableAccount(account);
  }
 }
 // remove accounts that are not in config
 for (let account of accounts_list) {
  if (!value.find(conf => conf.id === get(account).id)) {
   console.log('REMOVE ACCOUNT', get(account));
   _disableAccount(account);
   accounts.update(v => v.filter(a => get(a).id !== get(account).id));
  }
 }
});

export function toggleAccountEnabled(id) {
 console.log('TOGGLE ACCOUNT ENABLED', id);
 console.log('TOGGLE ACCOUNT ENABLED', accounts_config);
 accounts_config.update(v =>
  v.map(a => {
   if (a.id === id) a.enabled = !a.enabled;
   return a;
  })
 );
}

export function selectAccount(id) {
 console.log('SELECT ACCOUNT', id);
 let old_selected_module = get(selected_module_id);
 selected_module_id.set(null);
 active_account_id.set(id);
 tick().then(() => {
  if (get(active_account).module_data[old_selected_module]) selected_module_id.set(old_selected_module);
 });
}

function constructAccount(id, credentials, enabled, settings) {
 let account = {
  id,
  settings,
  credentials,
  enabled,
  /*
    also stuff like (set on heartbeat, for example):

    acc.lastCommsTs = Date.now();
    acc.status = 'Connected.';
    acc.error = null;

    We should put all this stuff in a separate object, let's say "meta".
    And try to stuff credentials into settings maybe.
    And each of these nested objects of interest can be a store, so we can update them independently, without causing a global update on each heartbeat.
  */
  events: new EventTarget(),
  requests: {},
  module_data: {},
 };

 return writable(account);
}

function _enableAccount(account) {
 let acc = get(account);
 acc.enabled = true;
 acc.suspended = false;
 acc.status = 'Enabled.';
 account.update(v => v);
 // TODO: use admin logic
 reconnectAccount(account);
}

function _disableAccount(account) {
 let acc = get(account);
 disconnectAccount(acc);
 clearHeartbeatTimer(acc);
 clearReconnectTimer(account);
 acc.enabled = false;
 acc.suspended = false;
 acc.status = 'Disabled.';
 account.update(v => v);
}

function reconnectAccount(account) {
 let acc = get(account);
 if (!acc.enabled) return;
 if (acc.suspended) {
  console.log('account suspended. not reconnecting.');
  return;
 }
 if (acc.status != 'Enabled.' && acc.status != 'Retrying...') {
  console.log('Account status not "Enabled." or "Retrying...", not reconnecting:', acc.status);
  return;
 }

 //clearHeartbeatTimer(acc);
 clearReconnectTimer(account);

 let socket_id;

 console.log('acc.socket.readyState:', acc.socket?.readyState);
 if (!acc.socket || acc.socket.readyState === WebSocket.CLOSED || acc.socket.readyState === WebSocket.CONNECTING || acc.socket.readyState === WebSocket.CLOSING || acc.socket.url !== acc.credentials.server) {
  if (acc.socket) {
   if (acc.socket.readyState !== WebSocket.CLOSED) {
    acc.socket.close();
    acc.socket.onopen = event => console.log('old socket onopen', event);
    acc.socket.onerror = event => console.log('old socket onerror', event);
    acc.socket.onclose = event => console.log('old socket onclose', event);
    acc.socket.onmessage = event => console.log('old socket onmessage', event);
   }
  }
  socket_id = global_socket_id++;
  console.log('Creating new WebSocket:', acc.credentials.server);
  acc.status = 'Connecting...';
  account.update(v => v);

  try {
   acc.socket = new WebSocket(acc.credentials.server);
  } catch (e) {
   const msg = e.message;
   acc.error = msg;
   acc.suspended = true;
   acc.status = 'Error.';
   account.update(v => v);
   return;
  }

  acc.socket.onmessage = event => handleSocketResponse(acc, JSON.parse(event.data));

  acc.socket.onopen = event => {
   console.log('Connected to WebSocket ' + socket_id + ':', event);
   acc.status = 'Connected, logging in...';
   account.update(v => v);
   sendLoginCommand(account);
  };

  acc.socket.onerror = event => {
   console.log('WebSocket ' + socket_id + ' error:', event);
   retry(account, 'Connection error.');
   acc.error = 'Error.';
   account.update(v => v);
  };

  acc.socket.onclose = event => {
   console.log('WebSocket ' + socket_id + '  closed:', event);
   retry(account, 'Connection closed.');
  };

  clearHeartbeatTimer(acc);
  setupHeartbeat(account);
 }
}

function retry(account, msg) {
 let acc = get(account);
 if (!acc.enabled || acc.suspended) return;
 acc.status = 'Retrying...';
 acc.error = msg;
 //clearHeartbeatTimer(acc);
 //acc.sessionID = null;
 account.update(v => v);
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

function clearHeartbeatTimer(acc) {
 if (acc.heartbeatTimer) {
  clearInterval(acc.heartbeatTimer);
  acc.heartbeatTimer = null;
 }
}

function sendLoginCommand(account) {
 console.log('Sending login command');
 let acc = get(account);
 send(acc, 'core', 'user_login', { address: acc.credentials.address, password: acc.credentials.password }, false, (req, res) => {
  console.log('Login response:', res);
  if (res.error !== 0) {
   acc.error = res.message;
   acc.status = 'Login failed.';
   acc.suspended = true;
   console.error('Login failed:', res);
  } else {
   acc.status = 'Logged in.';
   acc.error = null;
   acc.sessionID = res.data.sessionID;
   initModuleData(account);
  }
  account.update(v => v);
 });
}

function setupHeartbeat(account) {
 let acc = get(account);
 acc.heartbeatTimer = setInterval(() => {
  if (!acc.socket || acc.socket.readyState !== WebSocket.OPEN) {
   acc.status = 'Retrying...';
   acc.error = 'Not connected.';
   account.update(v => v);
   reconnectAccount(account);
   return;
  }
  send(
   acc,
   'core',
   'user_heartbeat',
   {},
   true,
   (req, res) => {
    //console.log('Heartbeat response:', res);
    acc.lastCommsTs = Date.now();
    acc.status = 'Connected.';
    acc.error = null;
    account.update(v => v);
   },
   true
  );
  if (Date.now() - acc.lastCommsTs > heartbeat_interval * 2) {
   const msg = 'No comms for 15 seconds, reconnecting...';
   console.log(msg);
   // not sure if we want to use retry() here, not sure if we can trust the browser not to fire off any more message events even if we close()'d the socket, so let's wait all the way until we call reconnectAccount()
   acc.status = 'Retrying...';
   acc.error = msg;
   //clearHeartbeatTimer(acc);
   //acc.sessionID = null;
   account.update(v => v);
   reconnectAccount(account);
  }
 }, heartbeat_interval);
}

export function order(dict) {
 return Object.values(dict).sort((a, b) => {
  return String.prototype.localeCompare(a.id + a.order) < String.prototype.localeCompare(b.id + b.order);
 });
}

function initModuleData(account) {
 let acc = get(account);

 console.log('module_decls:', JSON.stringify(module_decls));

 for (const [module_id, decl] of Object.entries(module_decls)) {
  console.log('initModuleData module_id:', module_id, 'decl:', decl);
  if (decl.callbacks.initData) {
   acc.module_data[module_id] = decl.callbacks?.initData(acc);
  } else {
   acc.module_data[module_id] = {};
  }
  acc.module_data[module_id].id = decl.id;
  acc.module_data[module_id].decl = decl;
  if (decl.callbacks.initComms) {
   decl.callbacks.initComms(acc);
  }
 }

 account.update(v => v);
 console.log('initModuleData:', acc);
 console.log('initModuleData:', acc.module_data);
}

function disconnectAccount(acc) {
 for (const [module_id, decl] of Object.entries(module_decls)) {
  if (decl.callbacks.deinitComms) {
   decl.callbacks.deinitComms(acc);
  }
  if (decl.callbacks.deinitData) {
   decl.callbacks.deinitData(acc);
  }

  if (acc.socket) {
   acc.socket.close();
   acc.socket = null;
  }
  acc.requests = {};
  acc.module_data = {};

  console.log('Account disconnected');
 }
}

function handleSocketResponse(acc, res) {
 console.log('RESPONSE', res);
 if (res.requestID) {
  // it is response to command:
  const reqData = acc.requests[res.requestID];
  if (reqData.callback) reqData.callback(reqData.req, res);
  delete acc.requests[res.requestID];
 } else if (res.event) {
  // it is event:
  console.log('GOT EVENT', res);
  acc.events.dispatchEvent(new CustomEvent(res.event, { detail: res }));
 } else console.log('Unknown command from server:', res);
}

export function getGuid(length = 40) {
 let result = '';
 while (result.length < length) result += Math.random().toString(36);
 return result;
}

export function send(acc, target, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
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

 acc.requests[requestID] = { req, callback };
 if (!quiet) {
  console.log('------------------');
  console.log('SENDING COMMAND:');
  console.log(req);
  console.log('------------------');
 }
 acc.socket.send(JSON.stringify(req));
 return requestID;
}

let lastRequestId = 0;

function generateRequestID() {
 return ++lastRequestId;
}

export default { hideSidebarMobile, isClientFocused, accounts };
