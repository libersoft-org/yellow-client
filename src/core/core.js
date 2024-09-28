import { tick } from 'svelte';
import { get, writable, derived } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.js';

export const hideSidebarMobile = writable(false);
export let isClientFocused = writable(true);
export let selected_corepage_id = writable(null);
export let selected_module_id = writable(null);


// declarations of modules that this client supports
let module_decls = [];

export function getModuleDecls() {
 console.log('GET MODULE DECLS:', module_decls);
 return module_decls;
}

export function registerModule(id, decl) {
 module_decls.push(decl);
 console.log('REGISTER MODULE:', id, decl);
}

const active_account_id = localStorageSharedStore('active_account_id', null);


export const accounts_config = localStorageSharedStore('accounts_config', [
 {
  id: 1,
  title: 'Account 1',
  enabled: true,
  credentials: {
   server: import.meta.env.VITE_AMTP_SERVER_WS_URL || '',
   address: 'user@example.com',
   password: '123456789'
  }
 },
 {
  id: 2,
  title: 'Account 2',
  enabled: false,
  credentials: {
   server: import.meta.env.VITE_AMTP_SERVER_WS_URL || '',
   address: 'user2@example.com',
   password: '123456789'
  }
 }
]);

export let accounts = writable([]);

export let active_account_store = derived([accounts, active_account_id], ([$accounts, $active_account_id]) => {
 console.log('active_account_store:', $accounts, $active_account_id);
 let r = $accounts.find(acc => get(acc).id === $active_account_id);
 console.log('active_account_store:', r);
 return r;
});

// Create a derived store that depends on active_account_store and its nested account store
export let active_account = derived(active_account_store, ($active_account_store, set) => {
 if (!$active_account_store) {
  return set(null);
 }

 const unsubscribe = $active_account_store.subscribe(account => {
  console.log('DERIVED NESTED STORE:', account);
  set(account);
 });
 return () => unsubscribe();
});

active_account.subscribe(value => {
 console.log('ACTIVE ACCOUNT:', value);
});

export function module_data_derived(module_id) {
 return derived(active_account, $active_account => {
  if (!$active_account) {
   console.log('no active account => no module data.');
   return null;
  }
  let acc = $active_account;
  console.log('$active_account:', acc, 'MODULE ID:', module_id);
  let result = acc.module_data[module_id];
  console.log('MODULE DATA:', result);
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
 console.log('ACCOUNTS CONFIG:', value);
 //TODO: implement configuration of accounts order
 let accounts_list = get(accounts);
 console.log('EXISTING ACCOUNTS (stores):', accounts_list);
 for (let config of value) {
  console.log('CONFIG', config);
  let account = accounts_list.find(acc => get(acc).id === config.id);
  console.log('account', account);
  if (account) {
   let acc = get(account);

   if (acc.title != config.title) {
    acc.title = config.title;
    account.update(v => v);
   }

   if (acc.credentials.server != config.credentials.server || acc.credentials.address != config.credentials.address || acc.credentials.password != config.credentials.password) {
    acc.credentials = config.credentials;
    _disableAccount(account);
    _enableAccount(account);
   }

   if (acc.enabled != config.enabled) {
    if (config.enabled) {
     _enableAccount(account);
    } else {
     _disableAccount(account);
    }
   }
  } else {
   // add new account
   let account = constructAccount(config.id, config.title, config.credentials, config.enabled);
   console.log('NEW account', get(account));
   accounts.update(v => [...v, account]);

   selectAccount(get(account).id);

   if (config.enabled) {
    _enableAccount(account);
   } else {
    _disableAccount(account);
   }
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
  if (get(active_account).module_data[old_selected_module]) {
   selected_module_id.set(old_selected_module);
  }
 });
}

function constructAccount(id, title, credentials, enabled) {
 let account = {
  id,
  title,
  credentials,
  enabled,
  events: new EventTarget(),
  requests: {},
  module_data: {}
 };

 return writable(account);
}

function _enableAccount(account) {
 get(account).enabled = true;
 account.update(v => v);
 // TODO: use admin logic
 reconnectAccount(account);
}

function _disableAccount(account) {
 let acc = get(account);
 acc.enabled = false;
 account.update(v => v);
 disconnectAccount(account);
}

function reconnectAccount(account) {
 let acc = get(account);
 console.log('Reconnecting account:', acc);
 if (!acc.enabled) return;
 acc.socket = new WebSocket(acc.credentials.server);
 acc.socket.onopen = event => acc.events.dispatchEvent(new CustomEvent('open', { event }));
 acc.socket.onerror = event => acc.events.dispatchEvent(new CustomEvent('error', { event }));
 acc.socket.onclose = event => acc.events.dispatchEvent(new CustomEvent('close', { event }));
 acc.socket.onmessage = event => handleSocketResponse(acc, JSON.parse(event.data));
 acc.events.addEventListener('open', event => {
  console.log('Connected to WebSocket:', event);
  if (acc.loggingIn) sendLoginCommand(account);
 });

 acc.events.addEventListener('error', event => {
  console.log('WebSocket error:', event);
  acc.error = 'Cannot connect to server';
  acc.loggingIn = false;
 });

 acc.events.addEventListener('close', event => {
  console.log('WebSocket closed:', event);
  acc.loggingIn = false;
 });

 acc.loggingIn = true;
}

function sendLoginCommand(account) {
 console.log('Sending login command');
 let acc = get(account);
 send(acc, 'user_login', { address: acc.credentials.address, password: acc.credentials.password }, false, (req, res) => {
  console.log('Login response:', res);
  acc.loggingIn = false;
  if (res.error !== 0) {
   acc.error = res.message;
   console.error('Login error:', res);
  } else {
   acc.sessionID = res.data.sessionID;
   initModuleData(account);
  }
  account.update(v => v);
 });
}

export function order(dict) {
 return Object.values(dict).sort((a, b) => {
  return String.prototype.localeCompare(a.id + a.order) < String.prototype.localeCompare(b.id + b.order);
 });
}

function initModuleData(account) {
 let acc = get(account);
 acc.module_data = {
  messages: module_decls[0].initData(acc),
  contacts: { id: 'contacts', decl: { id: 'contacts', name: 'Contacts' } },
  wallet: { id: 'wallet', decl: { id: 'wallet', name: 'wallet' } }
 };
 account.update(v => v);
 console.log('initModuleData:', acc);
 console.log('initModuleData:', acc.module_data);

 if (!get(selected_module_id)) {
  if (acc.module_data.messages) selected_module_id.set('messages');
 }

 module_decls[0].initComms(acc);
}

export function deinitModuleData(acc) {
 module_decls[0].deinitData(acc);
}

function disconnectAccount(account) {
 let acc = get(account);
 if (acc.socket) {
  send(acc, 'user_unsubscribe', { event: 'new_message' });
  send(acc, 'user_unsubscribe', { event: 'seen_message' });
  acc.socket.close();
  acc.socket = null;
  acc.requests = {};
  acc.module_data = {};
  account.update(v => v);
  console.log('Account disconnected');
 }
}

function handleSocketResponse(acc, res) {
 //console.log('RESPONSE', res);
 if (res.requestID) {
  // it is response to command:
  const reqData = acc.requests[res.requestID];
  if (reqData?.req?.command) {
   //console.log('REQUEST', reqData.req);
   if (reqData.callback) reqData.callback(reqData.req, res);
   delete acc.requests[res.requestID];
  } else console.log('Request command not found');
 } else if (res.event) {
  // it is event:
  console.log('GOT EVENT', res);
  //TODO: send event to messages module:
  acc.events.dispatchEvent(new CustomEvent(res.event, { detail: res }));
 } else console.log('Unknown command from server:', res);
}

export function getRandomString(length = 40) {
 let result = '';
 while (result.length < length) result += Math.random().toString(36).substring(2);
 return result.substring(0, length);
}

export function send(acc, command, params = {}, sendSessionID = true, callback = null) {
 if (!acc) {
  console.error('Error while sending command: account is not defined');
  return;
 }
 if (!acc.socket || acc.socket.readyState !== WebSocket.OPEN) {
  console.error('Error while sending command: WebSocket is not open');
  return;
 }
 const requestID = generateRequestID();

 const req = { requestID };
 if (sendSessionID) req.sessionID = acc.sessionID;
 if (command) req.command = command;
 if (params) req.params = params;
 acc.requests[requestID] = { req, callback };
 console.log('------------------');
 console.log('SENDING COMMAND:');
 console.log(req);
 console.log('------------------');
 acc.socket.send(JSON.stringify(req));
 return requestID;
}

let lastRequestId = 0;

function generateRequestID() {
 return ++lastRequestId;
}

export default { hideSidebarMobile, isClientFocused, accounts };
