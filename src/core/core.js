import {get, writable, derived} from 'svelte/store';
import {localStorageSharedStore} from '../lib/svelte-shared-store.js';


export const hideSidebarMobile = writable(false);
export let isClientFocused = writable(true);


let modules = [];
export function registerModule(id, callbacks) {
 modules.push(callbacks);
}


const accounts_config = localStorageSharedStore('accounts_config', [
 {id: 1, title: 'Account 1', enabled: false, credentials: {server: import.meta.env.VITE_AMTP_SERVER_WS_URL||'', address: 'user@example.com', password: '123456789'}},
 {id: 2, title: 'Account 2', enabled: false, credentials: {server: import.meta.env.VITE_AMTP_SERVER_WS_URL||'', address: 'user2@example.com', password: '123456789'}},
]);

export let accounts = writable([]);

export let active_account_store = writable(null);
export let active_account = derived(active_account_store, $active_account_store => {
 if ($active_account_store)
  return get($active_account_store);
 else
  return {};
})

active_account_store.subscribe(value => {
 // console.log('ACTIVE ACCOUNT:', value);
 console.log('ACTIVE ACCOUNT:', maybeGet(value));
});

function maybeGet(store) {
 if (store)
  return get(store);
}

export function module_data(module_id) {
 return derived(active_account_store, $active_account_store => {
  if (!$active_account_store)
   return null;
  let result = get($active_account_store).module_data[module_id];
  console.log('$active_account_store:', get($active_account_store));
  console.log('MODULE DATA:', result);
 });
}


accounts_config.subscribe(value => {
 console.log('ACCOUNTS CONFIG:', value);
 //TODO: implement configuration of order of accounts
 let accs = get(accounts);
 for (let config of value) {
  console.log('CONFIG', config);
  let acc = accs.find(acc => acc.id === config.id);
  console.log('ACC', acc);
  if (acc) {

   if (acc.title != config.title) {
    acc.title = config.title;
    acc.update(v => v);
   }

   if (acc.credentials.server != config.credentials.server ||
    acc.credentials.address != config.credentials.address ||
    acc.credentials.password != config.credentials.password) {
    acc.credentials = config.credentials;
    _disableAccount(acc);
    _enableAccount(acc);
   }

   if (acc.enabled != config.enabled) {
    if (config.enabled)
     _enableAccount(acc);
    else
     _disableAccount(acc);
   }

  } else {
   // add new account
   let account = constructAccount(config.id, config.title, config.credentials, config.enabled);
   console.log('NEW ACC', get(account));
   accounts.update(v => [...v, account]);

    console.log('SELECT ACCOUNT');
    selectAccount(get(account).id);

   if (config.enabled)
    _enableAccount(account);
   else
    _disableAccount(account);

  }
 }
 // remove accounts that are not in config
 for (let acc of accs) {
  if (!value.find(conf => conf.id === acc.id)) {
   _disableAccount(acc);
   accounts.update(v => v.filter(a => a.id !== acc.id));
  }
 }
});


export function toggleAccountEnabled(id) {
 console.log('TOGGLE ACCOUNT ENABLED', id);
 console.log('TOGGLE ACCOUNT ENABLED', accounts_config);
 accounts_config.update(v => v.map(a => {
  if (a.id === id) a.enabled = !a.enabled;
  return a;
 }));
}


export function selectAccount(id) {
 console.log('SELECT ACCOUNT', id);
 let account = get(accounts).find(acc => get(acc).id === id);
 console.log('SELECTED ACCOUNT', account);
 active_account_store.set(account);
}

export function addAccount(credentials) {
 accounts_config.update(v => [...v, {
  id: getRandomString(),
  title: 'New Account',
  enabled: false,
  credentials,
 }]);
}

function constructAccount(id, title, credentials, enabled) {
 let account = {
  id,
  title,
  credentials,
  enabled,
  events: new EventTarget(),
  requests: {},
  module_data: {},
 }

 return writable(account);
}

function _enableAccount(account) {
 get(account).enabled = true;
 account.update(v => v);

 // todo use admin logic
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
 acc.socket.onopen = event => acc.events.dispatchEvent(new CustomEvent('open', {event}));
 acc.socket.onerror = event => acc.events.dispatchEvent(new CustomEvent('error', {event}));
 acc.socket.onclose = event => acc.events.dispatchEvent(new CustomEvent('close', {event}));
 acc.socket.onmessage = event => handleSocketResponse(acc, JSON.parse(event.data));

 acc.events.addEventListener('open', event => {
  console.log('Connected to WebSocket:', event);
  if (acc.loggingIn)
   sendLoginCommand(account);
 });

 acc.events.addEventListener('error', event => {
  console.error('WebSocket error:', event);
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
 send(acc, 'user_login', {address: acc.credentials.address, password: acc.credentials.password}, false, (req, res) => {
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

function initModuleData(account) {
 let acc = get(account);
 acc.module_data = {
  contacts: {id: 'contacts'},
  messages: modules[0].initData(acc),
 };
 account.update(v => v);
 console.log('initModuleData:', acc);
 console.log('initModuleData:', acc.module_data);
 modules[0].initComms(acc);
}

export function deinitModuleData(acc) {
 modules[0].deinitData(acc);
}

function disconnectAccount(acc) {
 if (acc.socket) {
  acc.send('user_unsubscribe', {event: 'new_message'});
  acc.send('user_unsubscribe', {event: 'seen_message'});

  acc.socket.close();
  acc.socket = null;
  acc.requests = {};

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
  acc.events.dispatchEvent(new CustomEvent(res.event, {detail: res}));
 } else console.log('Unknown command from server:', res);
}

function getRandomString(length = 40) {
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


 const req = {requestID};
 if (sendSessionID) req.sessionID = acc.sessionID;
 if (command) req.command = command;
 if (params) req.params = params;
 acc.requests[requestID] = {req, callback};

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

export default {hideSidebarMobile, isClientFocused, accounts,  module_data};
