import { TAURI, TAURI_MOBILE } from '@/core/scripts/tauri.ts';
import { redact } from '@/core/scripts/redact.ts';
import type { BrowserOptions, NodeOptions } from '@sentry/sveltekit';

// Base configuration shared between client and server
export const sentryBaseConfig = {
	dsn: 'https://3d18b31f479eb4d197cf54e7ef5c4291@o4509327469772800.ingest.de.sentry.io/4509327534981200',
	environment: import.meta.env['MODE'] || 'development',
	tracesSampleRate: 1.0,
};

// Get platform information
export function getPlatformInfo(): string {
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
export function getHostname(): string {
	if (typeof window === 'undefined') {
		// Server-side: try to get hostname from environment or os
		try {
			return process.env['HOSTNAME'] || 'server';
		} catch {
			return 'server';
		}
	}
	// Client-side
	return window.location.hostname;
}

// Common beforeSend hook
type BeforeSendHook = (event: any, hint: any) => any;

/** Strip secrets from a single breadcrumb, keeping its shape intact. */
function redactBreadcrumb(crumb: any): any {
	if (!crumb) return crumb;
	const out = { ...crumb };
	if (out.data !== undefined) out.data = redact(out.data);
	if (typeof out.message === 'string') out.message = redact(out.message);
	return out;
}

/** Console/fetch/xhr breadcrumbs are recorded before beforeSend runs, so they get their own hook. */
export function createBeforeBreadcrumbHook(): (crumb: any, hint: any) => any {
	return (crumb: any, _hint: any) => redactBreadcrumb(crumb);
}

export function createBeforeSendHook(isServer: boolean = false): BeforeSendHook {
	return (event: any, _hint: any) => {
		const platform = getPlatformInfo();
		const hostname = getHostname();

		/* Scrub before we add our own metadata, so the tags below survive verbatim. Console
		 * breadcrumbs in particular carry whatever the app logged. */
		if (event.extra) event.extra = redact(event.extra);
		if (event.contexts) event.contexts = redact(event.contexts);
		if (event.request) event.request = redact(event.request);
		if (Array.isArray(event.breadcrumbs)) event.breadcrumbs = event.breadcrumbs.map((crumb: any) => redactBreadcrumb(crumb));

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
				buildMode: import.meta.env['MODE'],
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
	beforeBreadcrumb: createBeforeBreadcrumbHook(),
};

// Server configuration
export const sentryServerConfig: NodeOptions = {
	...sentryBaseConfig,
	beforeSend: createBeforeSendHook(true),
	beforeBreadcrumb: createBeforeBreadcrumbHook(),
};
