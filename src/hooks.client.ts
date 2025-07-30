// <sentry>
import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { sentryClientConfig } from '@/core/scripts/sentry-config.ts';

// Only initialize Sentry if enabled
const sentryEnabled = /^(true|1|yes|on)$/i.test((import.meta.env.VITE_SENTRY_ENABLED || '').trim());

if (sentryEnabled) {
	Sentry.init({
		...sentryClientConfig,
		// If you don't want to use Session Replay, just remove the line below:
		integrations: [replayIntegration()],
	});
}

// </sentry>

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export async function handleError(eee: any): Promise<{ message: string }> {
	console.error('handleError:', eee.error);
	if (sentryEnabled) {
		return await handleErrorWithSentry(eee);
	} else return { message: eee.message || 'An error occurred' };
}

export function init() {
	console.log('Client-side initialization complete');
}
