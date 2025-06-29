import type { Account, AccountStore } from './types.ts';
import { TAURI_SERVICE } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';

export function sendAsync(acc: Account, account: AccountStore | null, target: string, command: string, params: any = {}, sendSessionID = true, quiet = false) {
	return new Promise((resolve, reject) => {
		send(
			acc,
			account,
			target,
			command,
			params,
			sendSessionID,
			(req: any, res: any) => {
				resolve(res);
			},
			quiet
		);
	});
}

export function send(acc: Account, account: AccountStore | null, target: string, command: string, params: any = {}, sendSessionID = true, callback: ((req: any, res: any) => void) | null = null, quiet = false) {
	/*
 acc: account object
 account: account store, optional, for debugging
  */
	if (!acc) {
		console.error('Error while sending command: account is not defined');
		return;
	}

	// On service-based connections, route through native connection
	if (TAURI_SERVICE) {
		const requestID = generateRequestID();
		const req: any = {
			target: target,
			requestID,
		};
		if (sendSessionID) req.sessionID = acc.sessionID;
		if (command || params) req.data = {};
		if (command) req.data.command = command;
		if (params) req.data.params = params;

		// Store the callback for when we receive the response
		acc.requests[requestID] = {
			req,
			callback: (req: any, res: any) => {
				if (res.error) {
					console.debug(res);
				}
				if (callback) callback(req, res);
			},
			quiet,
		};

		// Send through native bridge
		invoke('plugin:yellow|send_to_native', {
			accountId: acc.id,
			message: req,
		}).catch(error => {
			console.error('Failed to send message through native:', error);
			if (callback) callback(req, { error: true, message: 'Native send failed' });
		});

		return;
	}

	if (!acc.socket || acc.socket.readyState !== WebSocket.OPEN) {
		console.debug('Error while sending command: WebSocket is not open');
		return;
	}
	const requestID = generateRequestID();
	const req: any = {
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
		callback: (req: any, res: any) => {
			if (res.error) {
				console.debug(res);
			}
			if (callback) callback(req, res);
		},
	};
	/* if (!quiet) {
  console.log('------------------');
  console.log('SENDING COMMAND:');*/
	//console.log(req);
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

export function handleSocketMessage(acc: Account, res: any) {
	//console.log('MESSAGE FROM SERVER', res);
	if (res.requestID) {
		// it is response to command:
		//console.log('GOT RESPONSE');
		const reqData = acc.requests[res.requestID];

		// Check for session-related errors
		if (res.error === 994 || res.error === 998 || res.error === 996) {
			// Error 994: Session expired, 998: Invalid user session ID, 996: User session is missing
			console.debug('Session error detected:', res.error, res.message);
			// Dispatch custom event for session error
			acc.events?.dispatchEvent(
				new CustomEvent('session_error', {
					detail: {
						error: res.error,
						message: res.message,
						originalRequest: reqData.req,
					},
				})
			);
		}

		if (reqData.callback) reqData.callback(reqData.req, res);
		delete acc.requests[res.requestID];
	} else if (res.event) {
		//console.log('EVENT:', res);
		acc.events?.dispatchEvent(new CustomEvent(res.event, { detail: res }));
	} else console.log('Unknown command from server:', res);
}
