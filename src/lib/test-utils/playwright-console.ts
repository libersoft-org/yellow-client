import type { Page } from '@playwright/test';

/**
 * Global console logging utility for Playwright tests
 *
 * Usage:
 * 1. Import: import { enableConsoleLogging } from '@/lib/test-utils/playwright-console.ts';
 * 2. Add to test: enableConsoleLogging(page);
 * 3. Run with: PLAYWRIGHT_CONSOLE_LOG=true npx playwright test
 *
 * Options:
 * - PLAYWRIGHT_CONSOLE_LOG=true (enables all console logs)
 * - PLAYWRIGHT_CONSOLE_LOG=errors (only errors and warnings)
 * - PLAYWRIGHT_CONSOLE_LOG=minimal (only errors and important info)
 */

export function enableConsoleLogging(page: Page): void {
	const logLevel = process.env.PLAYWRIGHT_CONSOLE_LOG;

	if (!logLevel || logLevel === 'false') {
		return;
	}

	const isMinimal = logLevel === 'minimal';
	const isErrorsOnly = logLevel === 'errors';
	const isVerbose = logLevel === 'true' || logLevel === 'verbose';

	page.on('console', msg => {
		const msgType = msg.type();
		const text = msg.text();

		// Filter noisy logs unless in verbose mode
		if (!isVerbose) {
			if (text.includes('[vite]') || text.includes('Service worker') || text.includes('selectLastModule') || text.includes('REGISTER MODULE') || (text.includes('WebSocket') && !text.includes('failed')) || text.includes('Retrying')) {
				return;
			}
		}

		// Apply log level filtering
		if (isErrorsOnly && !['error', 'warn'].includes(msgType)) {
			return;
		}

		if (isMinimal && !['error', 'warn'].includes(msgType) && !isImportantLog(text)) {
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

	// Always log page errors regardless of level
	page.on('pageerror', error => {
		console.log(`🔴 PAGE ERROR: ${error.message}`);
		console.log(`   Stack: ${error.stack}`);
	});

	// Log failed requests for debugging
	if (isVerbose || isMinimal) {
		page.on('requestfailed', request => {
			// Only log actual failures, not aborted requests
			const failure = request.failure();
			if (failure && !failure.errorText.includes('net::ERR_ABORTED')) {
				console.log(`🔴 REQUEST FAILED: ${request.method()} ${request.url()} - ${failure.errorText}`);
			}
		});
	}
}

function isImportantLog(text: string): boolean {
	return text.includes('Selected theme') || text.includes('Current theme changed') || text.includes('🎨') || text.includes('🔴') || text.includes('ERROR') || text.includes('Failed') || text.includes('Exception');
}

/**
 * Convenience function to enable console logging in beforeEach
 * Usage: test.beforeEach(withConsoleLogging);
 */
export const withConsoleLogging = async ({ page }: { page: Page }) => {
	enableConsoleLogging(page);
};

/**
 * Enhanced version with custom filtering
 */
export function enableConsoleLoggingWithFilter(page: Page, filter: (msgType: string, text: string) => boolean): void {
	if (!process.env.PLAYWRIGHT_CONSOLE_LOG) {
		return;
	}

	page.on('console', msg => {
		const msgType = msg.type();
		const text = msg.text();

		if (filter(msgType, text)) {
			switch (msgType) {
				case 'error':
					console.log(`🔴 CONSOLE ERROR: ${text}`);
					break;
				case 'warn':
					console.log(`🟡 CONSOLE WARN: ${text}`);
					break;
				default:
					console.log(`🔵 CONSOLE: ${text}`);
			}
		}
	});

	page.on('pageerror', error => {
		console.log(`🔴 PAGE ERROR: ${error.message}`);
	});
}
