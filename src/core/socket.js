import Core from './core.js';
const events = new EventTarget();
const requests = {};
let socket;
export let url;

export function connect(server) {
 if (server) url = server;
 if (socket && socket.readyState !== WebSocket.CLOSED) {
  console.error('Socket is already connected');
  return;
 }
 socket = new WebSocket(url);
 socket.onopen = event => events.dispatchEvent(new CustomEvent('open', { event }));
 socket.onerror = event => events.dispatchEvent(new CustomEvent('error', { event }));
 socket.onclose = event => events.dispatchEvent(new CustomEvent('close', { event }));
 socket.onmessage = event => handleResponse(JSON.parse(event.data));
}

export function disconnect() {
 if (!socket || socket.readyState === WebSocket.CLOSED) {
  console.error('Socket is not yet connected or already disconnected');
  return;
 }
 socket.close();
}

export function send(command, params = {}, sendSessionID = true, callback = null) {
 //console.log('------------------');
 //console.log('SENDING COMMAND:');
 //console.log('COMMAND:', command);
 //console.log('PARAMS:', params);
 //console.log('SEND SESSION ID:', sendSessionID);
 //console.log('CALLBACK:', callback);
 //console.log('------------------');
 if (!socket || socket.readyState !== WebSocket.OPEN) {
  console.error('Error while sending command: WebSocket is not open');
  return;
 }
 const requestID = getRandomString();
 const req = { requestID };
 if (sendSessionID) req.sessionID = Core.sessionID;
 if (command) req.command = command;
 if (params) req.params = params;
 requests[requestID] = { req, callback };
 socket.send(JSON.stringify(req));
}

export function status() {
 return socket?.readyState;
}

function handleResponse(res) {
 //console.log('RESPONSE', res);
 if (res.requestID) {
  // it is response to command:
  const reqData = requests[res.requestID];
  if (reqData?.req?.command) {
   //console.log('REQUEST', reqData.req);
   if (reqData.callback) reqData.callback(reqData.req, res);
   delete requests[res.requestID];
  } else console.log('Request command not found');
 } else if (res.event) {
  // it is event:
  //TODO: different types of events should also be tied with command and callback that requested them, use the same thing as with commands - to have a request ID
  switch (res.event) {
   case 'new_message':
    console.log('GOT EVENT', res);
    //TODO: send event to messages module:
    events.dispatchEvent(new CustomEvent('new_message', { detail: res }));
    break;
  }
 } else console.log('Unknown command from server');
}

function getRandomString(length = 40) {
 let result = '';
 while (result.length < length) result += Math.random().toString(36).substring(2);
 return result.substring(0, length);
}

export default {
 connect,
 disconnect,
 send,
 status,
 events,
 url
};
