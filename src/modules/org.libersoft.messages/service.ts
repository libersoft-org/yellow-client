// Messages Module Service for Android Background Processing
// This service runs in the Android foreground service JavaScript isolate

// Import connection utilities - these will be loaded/injected by the native layer
import { connectionSendData, initializeSubscriptions, deinitializeSubscriptions } from './connection.js';

interface KotlinBridge {
	sendMessage(data: string): void;
	log(level: string, message: string): void;
}

interface ServiceConfig {
	accountId: string;
	server: string;
	address: string;
}

// KotlinBridge will be available globally when running in Android
declare const KotlinBridge: KotlinBridge;

class MessagesBackgroundService {
	private config: ServiceConfig | null = null;
	private messageHandlers: Map<string, Function> = new Map();
	private account: any = null;

	init(config: ServiceConfig) {
		this.config = config;
		this.log('info', `Messages service initialized for account ${config.accountId}`);

		// Create account object compatible with connection module
		this.account = {
			id: config.accountId,
			credentials: { address: config.address },
			events: {
				addEventListener: (event: string, handler: Function) => {
					this.messageHandlers.set(event, handler);
				},
				removeEventListener: (event: string, handler: Function) => {
					this.messageHandlers.delete(event);
				},
			},
		};

		// Set up message handlers
		this.setupMessageHandlers();

		// Subscribe to message events using connection module
		this.subscribeToEvents();
	}

	private setupMessageHandlers() {
		// These handlers will be called when events are received
		const handlers = {
			new_message: this.handleNewMessage.bind(this),
			message_update: this.handleMessageUpdate.bind(this),
			seen_message: this.handleSeenMessage.bind(this),
			seen_inbox_message: this.handleSeenInboxMessage.bind(this),
			upload_update: this.handleUploadUpdate.bind(this),
			ask_for_chunk: this.handleAskForChunk.bind(this),
		};

		// Register handlers
		for (const [event, handler] of Object.entries(handlers)) {
			this.account.events.addEventListener(event, handler);
		}
	}

	private subscribeToEvents() {
		// Use connection module to subscribe (isService = true)
		const result = initializeSubscriptions(this.account, true);
		this.log('info', `Subscriptions initialized: ${result.subscribed ? 'yes' : 'no'}`);
	}

	handleMessage(message: any) {
		// Route incoming messages to appropriate handlers
		const eventType = message.event || message.type;
		const handler = this.messageHandlers.get(eventType);

		if (handler) {
			// Create event-like object for compatibility with frontend handlers
			const event = {
				detail: message,
			};
			handler(event);
		} else {
			this.log('debug', `Unhandled message event: ${eventType}`);
		}
	}

	private handleNewMessage(event: any) {
		const data = event.detail?.data || event.detail;
		this.log('info', `New message received from ${data?.address_from || 'unknown'}`);

		// Process message for notifications
		if (data) {
			this.processMessageForNotification(data);
		}
	}

	private handleMessageUpdate(event: any) {
		const data = event.detail?.data || event.detail;
		this.log('info', `Message update: ${data?.type || 'unknown'} for ${data?.message?.uid || 'unknown'}`);
	}

	private handleSeenMessage(event: any) {
		const data = event.detail?.data || event.detail;
		this.log('info', `Message seen: ${data?.uid || 'unknown'}`);
	}

	private handleSeenInboxMessage(event: any) {
		const data = event.detail?.data || event.detail;
		this.log('info', `Inbox message seen from ${data?.address_from || 'unknown'}`);
	}

	private handleUploadUpdate(event: any) {
		const data = event.detail?.data || event.detail;
		this.log('info', `Upload update: ${data?.record?.id || 'unknown'} status: ${data?.record?.status || 'unknown'}`);
	}

	private handleAskForChunk(event: any) {
		const data = event.detail?.data || event.detail;
		this.log('info', `Ask for chunk: upload ${data?.uploadId || 'unknown'} offset ${data?.offsetBytes || 0}`);
	}

	private processMessageForNotification(message: any) {
		// Check if this message is for our account and we're not the sender
		if (message.address_to === this.config?.address && message.address_from !== this.config?.address) {
			// Strip HTML from message for notification
			const text = message.message?.replace(/<[^>]*>?/gm, '') || 'New message';

			// Send notification request to Android
			this.sendToKotlin({
				target: 'android',
				command: 'show_notification',
				params: {
					title: `Message from ${message.address_from}`,
					text: text.substring(0, 100),
					accountId: this.config?.accountId,
					messageUid: message.uid,
					conversationAddress: message.address_from,
				},
			});
		}
	}

	// Send message through connection module
	sendMessageToServer(command: string, params: any) {
		connectionSendData(this.account, null, command, params, true, (req, res) => {
			if (res.error !== false) {
				this.log('error', `Error sending ${command}: ${res.message || 'Unknown error'}`);
			}
		});
	}

	private sendToKotlin(data: any) {
		try {
			KotlinBridge.sendMessage(JSON.stringify(data));
		} catch (error) {
			this.log('error', `Failed to send message to Kotlin: ${error}`);
		}
	}

	private log(level: string, message: string) {
		if (typeof KotlinBridge !== 'undefined') {
			KotlinBridge.log(level, `[MessagesService] ${message}`);
		} else {
			console.log(`[MessagesService] [${level}] ${message}`);
		}
	}

	destroy() {
		this.log('info', 'Service being destroyed');

		// Deinitialize subscriptions
		if (this.account) {
			deinitializeSubscriptions(this.account, true);
		}

		// Clear handlers
		this.messageHandlers.clear();
		this.account = null;
		this.config = null;
	}
}

// Create global instance
const messagesService = new MessagesBackgroundService();

// Export for global access from native layer
(globalThis as any).YellowMessagesService = {
	init: (config: ServiceConfig) => messagesService.init(config),
	handleMessage: (message: any) => messagesService.handleMessage(message),
	destroy: () => messagesService.destroy(),
};

// For module systems
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { YellowMessagesService: messagesService };
}
