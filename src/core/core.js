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

export let accounts = writable([
 //constructAccount(1, 'Account 1', {server: '', address: '', password: ''}),
]);

export let active_account_store = writable(null);
export let active_account = derived(active_account_store, $active_account_store => {
 if ($active_account_store)
  return get($active_account_store);
 else
  return {};
})

active_account_store.subscribe(value => {
 console.log('ACTIVE ACCOUNT:', value);
 console.log('ACTIVE ACCOUNT:', maybeGet(value));
});

function maybeGet(store) {
 if (store)
  return get(store);
}

export function md(module_id) {
 return derived(active_account_store, $active_account_store => {
  if (!$active_account_store)
   return null;
  return get($active_account_store).module_data[module_id];
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
   if (acc.enabled != config.enabled) {

    if (config.enabled)
     enableAccount(acc);
    else
     disableAccount(acc);
   }

   if (acc.title != config.title) {
    acc.title = config.title;
    acc.update(v => v);
   }

   if (acc.credentials.server != config.credentials.server ||
    acc.credentials.address != config.credentials.address ||
    acc.credentials.password != config.credentials.password) {
    acc.credentials = config.credentials;
    disableAccount(acc);
    enableAccount(acc);
   }
  } else {
   // add new account
   let acc = constructAccount(config.id, config.title, config.credentials);
   console.log('NEW ACC', get(acc));
   accounts.update(v => [...v, acc]);

    console.log('SELECT ACCOUNT');
    selectAccount(get(acc).id);

  }
 }
 // remove accounts that are not in config
 for (let acc of accs) {
  if (!value.find(conf => conf.id === acc.id)) {
   disableAccount(acc);
   accounts.update(v => v.filter(a => a.id !== acc.id));
  }
 }
});

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

function constructAccount(id, title, credentials) {
 let account = {
  id,
  title,
  credentials,
  enabled: false,
  events: new EventTarget(),
  requests: {},
  module_data: {},
 }

 return writable(account);
}

function enableAccount(account) {
 get(account).enabled = true;
 account.update(v => v);

 // todo use admin logic
 reconnectAccount(account);
}

function disableAccount(account) {
 let acc = get(account);
 acc.enabled = false;
 account.update(v => v);
 disconnectAccount(account);
}

function reconnectAccount(account) {
 let acc = get(account);

 if (!acc.enabled) return;

 acc.socket = new WebSocket(acc.credentials.server);
 acc.socket.onopen = event => events.dispatchEvent(new CustomEvent('open', {event}));
 acc.socket.onerror = event => events.dispatchEvent(new CustomEvent('error', {event}));
 acc.socket.onclose = event => events.dispatchEvent(new CustomEvent('close', {event}));
 acc.socket.onmessage = event => handleSocketResponse(acc, JSON.parse(event.data));

 acc.socket.events.addEventListener('open', event => {
  console.log('Connected to WebSocket:', event);
  if (acc.loggingIn)
   sendLoginCommand(account);
 });

 acc.socket.events.addEventListener('error', event => {
  console.error('WebSocket error:', event);
  acc.error = 'Cannot connect to server';
  acc.loggingIn = false;
 });

 acc.socket.events.addEventListener('close', event => {
  console.log('WebSocket closed:', event);
  acc.loggingIn = false;
 });

 acc.loggingIn = true;
}

function sendLoginCommand(account) {
 let acc = get(account);
 send(acc, 'user_login', {address: acc.credentials.address, password: acc.credentials.password}, false, (req, res) => {
  acc.loggingIn = false;
  if (res.error !== 0) {
   acc.error = res.message;
  } else {
   acc.sessionID = res.sessionID;
   initModuleData(acc);
  }
  account.update(v => v);
 });
}

function initModuleData(acc) {
 acc.module_data = {
  contacts: {id: 'contacts'},
  messages: modules[0].initData(acc),
 };

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
 } else console.log('Unknown command from server');
}

function getRandomString(length = 40) {
 let result = '';
 while (result.length < length) result += Math.random().toString(36).substring(2);
 return result.substring(0, length);
}

export function send(acc, command, params = {}, sendSessionID = true, callback = null) {
 //console.log('------------------');
 //console.log('SENDING COMMAND:');
 //console.log('COMMAND:', command);
 //console.log('PARAMS:', params);
 //console.log('SEND SESSION ID:', sendSessionID);
 //console.log('CALLBACK:', callback);
 //console.log('------------------');

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
 acc.socket.send(JSON.stringify(req));
 return requestID;
}

let lastRequestId = 0;

function generateRequestID() {
 return lastRequestId++;
}

export default {hideSidebarMobile, isClientFocused, accounts,  md};
