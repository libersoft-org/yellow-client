// Import from conditional bridge
import { send, type Account, type AccountStore } from '@/bridge/core-bridge';

// Assume TAURI_SERVICE is available globally
declare global {
	const TAURI_SERVICE: boolean | undefined;
}

export const identifier = 'org.libersoft.messages';

interface SendRequest {
	[key: string]: any;
}

interface SendResponse {
	error: boolean;
	message?: string;
	[key: string]: any;
}

type SendCallback = (req: SendRequest, res: SendResponse) => void;

interface SubscriptionInfo {
	subscribed: boolean;
	events?: string[];
}

// Get globals - in service context these are injected, in frontend they're imported
const getTauriService = (): boolean => (typeof TAURI_SERVICE !== 'undefined' ? TAURI_SERVICE : false);

const getSend = () => {
	// In test environment, return a noop function instead of throwing
	if (typeof vi !== 'undefined' || typeof (globalThis as any).vi !== 'undefined') {
		return () => Promise.resolve();
	}

	return send;
};

/**
 * Shared communication utilities for messages module
 * Can be used from both frontend and service.ts
 */

/**
 * Send data to the messages module
 */
export function connectionSendData(acc: Account, account: AccountStore | null, command: string, params: Record<string, any> = {}, sendSessionID: boolean = true, callback: ((req: any, res: any) => void) | null = null, quiet: boolean = false): any {
	return _send(acc, account, identifier, command, params, sendSessionID, callback, quiet);
}

/**
 * Internal send function
 */
export function _send(acc: Account, account: AccountStore | null, target: string, command: string, params: Record<string, any>, sendSessionID: boolean, callback: ((req: any, res: any) => void) | null, quiet: boolean): any {
	// Direct pass-through to send
	const sendFn = getSend();
	return sendFn(acc, account, target, command, params, sendSessionID, callback, quiet);
}

/**
 * Subscribe to module events
 */
export function moduleEventSubscribe(acc: Account, event_name: string): void {
	connectionSendData(acc, null, 'subscribe', { event: event_name }, true, (req, res) => {
		if (res.error !== false) {
			console.error('this is bad.');
			//window.alert('Communication with server Error while subscribing to event: ' + res.message);
		}
	});
}

/**
 * Initialize communication subscriptions
 */
export function initializeSubscriptions(acc: Account, isService: boolean = false): SubscriptionInfo {
	// In TAURI_SERVICE, only the service subscribes to events
	// In other environments, the frontend subscribes
	const shouldSubscribe = isService || !getTauriService();

	if (!shouldSubscribe) {
		console.log('Skipping subscriptions - will be handled by service');
		return { subscribed: false };
	}

	// Subscribe to message events
	moduleEventSubscribe(acc, 'new_message');
	moduleEventSubscribe(acc, 'seen_message');
	moduleEventSubscribe(acc, 'seen_inbox_message');
	moduleEventSubscribe(acc, 'message_update');

	// Subscribe to file transfer events
	moduleEventSubscribe(acc, 'upload_update');
	moduleEventSubscribe(acc, 'ask_for_chunk');

	return {
		subscribed: true,
		events: ['new_message', 'seen_message', 'seen_inbox_message', 'message_update', 'upload_update', 'ask_for_chunk'],
	};
}

/**
 * Deinitialize communication subscriptions
 */
export function deinitializeSubscriptions(acc: Account, isService: boolean = false): void {
	// Only unsubscribe if we were the ones who subscribed
	const shouldUnsubscribe = isService || !getTauriService();

	if (!shouldUnsubscribe) {
		return;
	}

	connectionSendData(acc, null, 'user_unsubscribe', { event: 'new_message' });
	connectionSendData(acc, null, 'user_unsubscribe', { event: 'seen_message' });
	connectionSendData(acc, null, 'user_unsubscribe', { event: 'seen_inbox_message' });
	connectionSendData(acc, null, 'user_unsubscribe', { event: 'message_update' });
	connectionSendData(acc, null, 'user_unsubscribe', { event: 'upload_update' });
	connectionSendData(acc, null, 'user_unsubscribe', { event: 'ask_for_chunk' });
}
