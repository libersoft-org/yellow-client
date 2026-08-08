import type { IAccount, IAccountRequest, AccountStore } from './types.ts';
import { TAURI_SERVICE } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';

export const REQUEST_TIMEOUT_MS = 60_000;

function transportError(message: string): { error: true; message: string } {
	return { error: true, message };
}

function completeRequest(acc: IAccount, requestID: number, response: any): void {
	const request = acc.requests[requestID];
	if (!request) return;
	delete acc.requests[requestID];
	clearTimeout(request.timeoutId);
	try {
		request.callback?.(request.req, response);
	} catch (error) {
		console.error('Request callback failed:', error);
	}
}

function registerRequest(acc: IAccount, requestID: number, req: any, callback: ((req: any, res: any) => void) | null, quiet: boolean): void {
	const request: IAccountRequest = {
		req,
		callback,
		quiet,
		timeoutId: setTimeout((): void => completeRequest(acc, requestID, transportError('Request timed out')), REQUEST_TIMEOUT_MS),
	};
	acc.requests[requestID] = request;
}

export function failPendingRequests(acc: IAccount, message: string): void {
	for (const requestID of Object.keys(acc.requests)) completeRequest(acc, Number(requestID), transportError(message));
}

export function sendAsync(acc: IAccount, account: AccountStore | null, target: string, command: string, params: any = {}, sendSessionID = true, quiet = false): Promise<any> {
	return new Promise<any>((resolve: (value: any) => void): void => {
		send(acc, account, target, command, params, sendSessionID, (_req: any, res: any): void => resolve(res), quiet);
	});
}

export function send(acc: IAccount, _account: AccountStore | null, target: string, command: string, params: any = {}, sendSessionID = true, callback: ((req: any, res: any) => void) | null = null, quiet = false): number | undefined {
	/*
 acc: account object
 account: account store, optional, for debugging
  */
	if (!acc) {
		console.error('Error while sending command: account is not defined');
		callback?.(null, transportError('Account is not defined'));
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
		registerRequest(
			acc,
			requestID,
			req,
			(req: any, res: any): void => {
				if (res.error) {
					console.debug(res);
				}
				if (callback) callback(req, res);
			},
			quiet
		);

		// Send through native bridge
		invoke('plugin:yellow|send_to_native', {
			accountId: acc.id,
			message: req,
		}).catch((error: unknown): void => {
			console.error('Failed to send message through native:', error);
			completeRequest(acc, requestID, transportError('Native send failed'));
		});

		return;
	}

	if (!acc.socket || acc.socket.readyState !== WebSocket.OPEN) {
		console.debug('Error while sending command: WebSocket is not open');
		callback?.(null, transportError('WebSocket is not open'));
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
	registerRequest(
		acc,
		requestID,
		req,
		(req: any, res: any): void => {
			if (res.error) console.debug(res);
			if (callback) callback(req, res);
		},
		quiet
	);
	/* if (!quiet) {
  console.log('------------------');
  console.log('SENDING COMMAND:');*/
	//console.log(req);
	/*console.log('------------------');
 }*/
	try {
		acc.socket.send(JSON.stringify(req));
	} catch (e) {
		console.error('WebSocket send failed:', e);
		completeRequest(acc, requestID, transportError('WebSocket send failed'));
		return;
	}
	acc.lastTransmissionTs = Date.now();
	acc.bufferedAmount = acc.socket.bufferedAmount;
	//console.log('bufferedAmount:', acc.bufferedAmount);
	return requestID;
}

let lastRequestId = 0;

function generateRequestID(): number {
	return ++lastRequestId;
}

export function handleSocketMessage(acc: IAccount, res: any): void {
	//console.log('MESSAGE FROM SERVER', res);
	if (res.requestID) {
		// it is response to command:
		//console.log('GOT RESPONSE');
		const reqData = acc.requests[res.requestID];
		if (!reqData) {
			console.warn('Received response for unknown request ID:', res.requestID);
			return;
		}

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

		completeRequest(acc, res.requestID, res);
	} else if (res.event) {
		//console.log('EVENT:', res);
		acc.events?.dispatchEvent(new CustomEvent(res.event, { detail: res }));
	} else console.log('Unknown command from server:', res);
}
