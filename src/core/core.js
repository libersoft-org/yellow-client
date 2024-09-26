import { get, writable } from 'svelte/store';
import Socket from './socket.js';

const events = new EventTarget();

export const hideSidebarMobile = writable(false);
export let isClientFocused = writable(true);

export let accounts = writable([constructAccount(1, 'Account 1', { server: '', address: '', password: '' })]);

export let account = writable(get(accounts)[0]);

export function selectAccount(id) {
 account.set(get(accounts).find(acc => acc.id === id));
}

function constructAccount(id, title, credentials) {
 let account = {
  id,
  title,
  credentials,

  address: credentials.address,

  enabled: false,
  events: new EventTarget(),
  requests: {},
  module_data: writable({})
 };

 return writable(account);
}

function enableAccount(account) {
 account.enabled = true;
 account.update(v => v);

 // todo use admin logic
 reconnectAccount(account);
}

function disableAccount(account) {
 account.enabled = false;
 account.update(v => v);

 disconnectAccount(account);
}

/*export function status() {
 return socket?.readyState;
}*/

function reconnectAccount(account) {
 let acc = get(account);

 if (!acc.enabled) return;

 acc.socket = new WebSocket(account.credentials.server);
 acc.socket.onopen = event => events.dispatchEvent(new CustomEvent('open', { event }));
 acc.socket.onerror = event => events.dispatchEvent(new CustomEvent('error', { event }));
 acc.socket.onclose = event => events.dispatchEvent(new CustomEvent('close', { event }));
 acc.socket.onmessage = event => handleSocketResponse(account, JSON.parse(event.data));

 acc.socket.events.addEventListener('open', event => {
  console.log('Connected to WebSocket:', event);
  sendLoginCommand(account.credentials);
 });

 acc.socket.events.addEventListener('error', event => {
  console.error('WebSocket error:', event);
  account.error = 'Cannot connect to server';
  account.loggingIn = false;
 });

 acc.socket.events.addEventListener('close', event => {
  console.log('WebSocket closed:', event);
  account.loggingIn = false;
 });

 initModuleData(acc);
}

function initModuleData(acc) {
 acc.module_data.set({
  contacts: {},
  messages: initMessagesModuleData(acc)
 });

 initMessagesModuleComms(acc);
}

export function deinitModuleData(acc) {
 deinitMessagesModuleData(acc);
}

function disconnectAccount(account) {
 if (account.socket) {
  Socket.send('user_unsubscribe', { event: 'new_message' });
  Socket.send('user_unsubscribe', { event: 'seen_message' });

  account.socket.close();
  account.socket = null;
  account.requests = {};

  console.log('Account disconnected');
 }
}

function handleSocketResponse(account, res) {
 //console.log('RESPONSE', res);
 if (res.requestID) {
  // it is response to command:
  const reqData = account.requests[res.requestID];
  if (reqData?.req?.command) {
   //console.log('REQUEST', reqData.req);
   if (reqData.callback) reqData.callback(reqData.req, res);
   delete account.requests[res.requestID];
  } else console.log('Request command not found');
 } else if (res.event) {
  // it is event:
  console.log('GOT EVENT', res);
  //TODO: send event to messages module:
  account.events.dispatchEvent(new CustomEvent(res.event, { detail: res }));
 } else console.log('Unknown command from server');
}

function getRandomString(length = 40) {
 let result = '';
 while (result.length < length) result += Math.random().toString(36).substring(2);
 return result.substring(0, length);
}

export function send(account, command, params = {}, sendSessionID = true, callback = null) {
 //console.log('------------------');
 //console.log('SENDING COMMAND:');
 //console.log('COMMAND:', command);
 //console.log('PARAMS:', params);
 //console.log('SEND SESSION ID:', sendSessionID);
 //console.log('CALLBACK:', callback);
 //console.log('------------------');

 if (!account) {
  console.error('Error while sending command: account is not defined');
  return;
 }
 if (!account.socket || account.socket.readyState !== WebSocket.OPEN) {
  console.error('Error while sending command: WebSocket is not open');
  return;
 }
 const requestID = generateRequestID();
 const req = { requestID };
 if (sendSessionID) req.sessionID = account.sessionID;
 if (command) req.command = command;
 if (params) req.params = params;
 account.requests[requestID] = { req, callback };
 account.socket.send(JSON.stringify(req));
 return requestID;
}

let lastRequestId = 0;
function generateRequestID() {
 return lastRequestId++;
}

//userAddress, sessionID

export default { hideSidebarMobile, isClientFocused, accounts, account };
