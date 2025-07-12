import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import { sentryServerConfig } from '@/core/scripts/sentry-config.ts';

// Only initialize Sentry if enabled
const sentryEnabled = /^(true|1|yes|on)$/i.test((process.env.VITE_SENTRY_ENABLED || '').trim());

if (sentryEnabled) {
	Sentry.init({
		...sentryServerConfig,
		// uncomment the line below to enable Spotlight (https://spotlightjs.com)
		// spotlight: import.meta.env.DEV,
	});
}

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sentryEnabled ? sequence(sentryHandle()) : sequence();

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = sentryEnabled
	? handleErrorWithSentry()
	: ({ error }) => {
			console.error('Unhandled error:', error);
		};
