import { TAURI, TAURI_MOBILE } from '@/core/scripts/tauri.ts';
import type { BrowserOptions, NodeOptions } from '@sentry/sveltekit';

// Base configuration shared between client and server
export const sentryBaseConfig = {
	dsn: 'https://3d18b31f479eb4d197cf54e7ef5c4291@o4509327469772800.ingest.de.sentry.io/4509327534981200',
	environment: process.env.NODE_ENV || 'development',
	tracesSampleRate: 1.0,
};

// Get platform information
export function getPlatformInfo() {
	if (typeof window === 'undefined') {
		return 'server';
	}

	let platform = 'web';
	if (TAURI) {
		platform = TAURI_MOBILE ? 'tauri-mobile' : 'tauri-desktop';
	}
	return platform;
}

// Get hostname
export function getHostname() {
	if (typeof window === 'undefined') {
		// Server-side: try to get hostname from environment or os
		return process.env.HOSTNAME || 'server';
	}
	// Client-side
	return window.location.hostname;
}

// Common beforeSend hook
export function createBeforeSendHook(isServer: boolean = false) {
	return (event: any, hint: any) => {
		const platform = getPlatformInfo();
		const hostname = getHostname();

		// Add custom tags for filtering
		event.tags = {
			...event.tags,
			platform,
			hostname,
			isServer: isServer.toString(),
		};

		// Add client-specific tags
		if (!isServer) {
			event.tags.tauri = TAURI.toString();
			event.tags.tauri_mobile = TAURI_MOBILE.toString();
		}

		// Add custom context data
		event.contexts = {
			...event.contexts,
			app: {
				platform,
				hostname,
				isServer,
				buildMode: process.env.NODE_ENV,
				...(!isServer && typeof window !== 'undefined'
					? {
							isTauri: TAURI,
							isTauriMobile: TAURI_MOBILE,
							userAgent: navigator.userAgent,
						}
					: {}),
			},
		};

		return event;
	};
}

// Client configuration
export const sentryClientConfig: BrowserOptions = {
	...sentryBaseConfig,
	replaysSessionSampleRate: 0, //0.1,
	replaysOnErrorSampleRate: 0, //1.0,
	beforeSend: createBeforeSendHook(false),
};

// Server configuration
export const sentryServerConfig: NodeOptions = {
	...sentryBaseConfig,
	beforeSend: createBeforeSendHook(true),
};
