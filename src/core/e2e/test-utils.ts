import type { Page } from '@playwright/test';

/**
 * Closes the welcome wizard modal if it appears
 * @param page - The Playwright page object
 */
export async function closeWelcomeWizardModal(page: Page): Promise<void> {
	const wizardCloseButton = page.getByTestId('welcome-wizard-Modal-close');
	if (await wizardCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
		await wizardCloseButton.click();
	}
}

/**
 * Enables console logging for Playwright tests when PLAYWRIGHT_CONSOLE_LOG is set
 * @param page - The Playwright page object
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
