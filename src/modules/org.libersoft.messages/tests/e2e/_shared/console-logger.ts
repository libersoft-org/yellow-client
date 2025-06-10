import type { Page } from '@playwright/test';

/**
 * Enables console logging for Playwright tests when PLAYWRIGHT_CONSOLE_LOG=true
 * Usage: setupConsoleLogging(page) in test.beforeEach or individual tests
 */
export function setupConsoleLogging(page: Page): void {
	// Only enable if environment variable is set
	if (process.env.PLAYWRIGHT_CONSOLE_LOG !== 'true') {
		return;
	}

	page.on('console', msg => {
		const msgType = msg.type();
		const text = msg.text();

		// Skip some noisy logs
		if (text.includes('[vite]') || text.includes('Service worker')) {
			return;
		}

		switch (msgType) {
			case 'error':
				console.log(`🔴 CONSOLE ERROR: ${text}`);
				break;
			case 'warn':
				console.log(`🟡 CONSOLE WARN: ${text}`);
				break;
			case 'info':
				console.log(`🔵 CONSOLE INFO: ${text}`);
				break;
			case 'debug':
				console.log(`🟢 CONSOLE DEBUG: ${text}`);
				break;
			default:
				console.log(`🔵 CONSOLE: ${text}`);
		}
	});

	// Also log uncaught exceptions and page errors
	page.on('pageerror', error => {
		console.log(`🔴 PAGE ERROR: ${error.message}`);
	});

	page.on('requestfailed', request => {
		console.log(`🔴 REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
	});
}

/**
 * Alternative: Setup console logging with custom options
 */
export function setupConsoleLoggingWithOptions(
	page: Page,
	options?: {
		enabled?: boolean;
		includeVite?: boolean;
		includeServiceWorker?: boolean;
		logRequests?: boolean;
	}
) {
	const { enabled = process.env.PLAYWRIGHT_CONSOLE_LOG === 'true', includeVite = false, includeServiceWorker = false, logRequests = false } = options || {};

	if (!enabled) {
		return;
	}

	page.on('console', msg => {
		const msgType = msg.type();
		const text = msg.text();

		// Filter based on options
		if (!includeVite && text.includes('[vite]')) return;
		if (!includeServiceWorker && text.includes('Service worker')) return;

		switch (msgType) {
			case 'error':
				console.log(`🔴 CONSOLE ERROR: ${text}`);
				break;
			case 'warn':
				console.log(`🟡 CONSOLE WARN: ${text}`);
				break;
			case 'info':
				console.log(`🔵 CONSOLE INFO: ${text}`);
				break;
			case 'debug':
				console.log(`🟢 CONSOLE DEBUG: ${text}`);
				break;
			default:
				console.log(`🔵 CONSOLE: ${text}`);
		}
	});

	page.on('pageerror', error => {
		console.log(`🔴 PAGE ERROR: ${error.message}`);
	});

	if (logRequests) {
		page.on('requestfailed', request => {
			console.log(`🔴 REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
		});
	}
}
