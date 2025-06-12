// <sentry>
import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { sentryClientConfig } from '@/core/sentry-config';

// Only initialize Sentry if enabled
const sentryEnabled = /^(true|1|yes|on)$/i.test((import.meta.env.VITE_SENTRY_ENABLED || '').trim());

if (sentryEnabled) {
	Sentry.init({
		...sentryClientConfig,
		// If you don't want to use Session Replay, just remove the line below:
		integrations: [replayIntegration()],
	});
}

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = sentryEnabled
	? handleErrorWithSentry()
	: ({ error }) => {
			console.error('Unhandled error:', error);
		};
// </sentry>
