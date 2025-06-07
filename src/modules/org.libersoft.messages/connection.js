// Assume TAURI_SERVICE and send are available globally
// In frontend: imported from modules
// In service: injected by native layer

export const identifier = 'org.libersoft.messages';

// Get globals - in service context these are injected, in frontend they're imported
const getTauriService = () => (typeof TAURI_SERVICE !== 'undefined' ? TAURI_SERVICE : false);
const getSend = () =>
	typeof send !== 'undefined'
		? send
		: () => {
				throw new Error('send() not available');
			};

/**
 * Shared communication utilities for messages module
 * Can be used from both frontend and service.ts
 */

/**
 * Send data to the messages module
 */
export function connectionSendData(acc, account, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
	return _send(acc, account, identifier, command, params, sendSessionID, callback, quiet);
}

/**
 * Internal send function
 */
export function _send(acc, account, target, command, params, sendSessionID, callback, quiet) {
	// Direct pass-through to send
	const sendFn = getSend();
	return sendFn(acc, account, target, command, params, sendSessionID, callback, quiet);
}

/**
 * Subscribe to module events
 * @param {Object} acc - Account object
 * @param {string} event_name - Event name to subscribe to
 */
export function moduleEventSubscribe(acc, event_name) {
	connectionSendData(acc, null, 'subscribe', { event: event_name }, true, (req, res) => {
		if (res.error !== false) {
			console.error('this is bad.');
			//window.alert('Communication with server Error while subscribing to event: ' + res.message);
		}
	});
}

/**
 * Initialize communication subscriptions
 * @param {Object} acc - Account object
 * @param {boolean} isService - Whether running in service context
 * @returns {Object} Subscription info
 */
export function initializeSubscriptions(acc, isService = false) {
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
 * @param {Object} acc - Account object
 * @param {boolean} isService - Whether running in service context
 */
export function deinitializeSubscriptions(acc, isService = false) {
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
