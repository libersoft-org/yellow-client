import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import { sentryServerConfig } from '@/core/sentry-config';

// Only initialize Sentry if enabled
const sentryEnabled = /^(true|1|yes|on)$/i.test((process.env.VITE_SENTRY_ENABLED || '').trim());

if (sentryEnabled) {
	Sentry.init({
		...sentryServerConfig,
		// uncomment the line below to enable Spotlight (https://spotlightjs.com)
		// spotlight: import.meta.env.DEV,
	});
}

const handleParaglide: Handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
		});
	});
};

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sentryEnabled ? sequence(sentryHandle(), handleParaglide) : sequence(handleParaglide);

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = sentryEnabled
	? handleErrorWithSentry()
	: ({ error }) => {
			console.error('Unhandled error:', error);
		};
