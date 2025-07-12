import { type Page, test } from '@playwright/test';

export async function closeWelcomeWizardWindow(page: Page): Promise<void> {
	const wizardCloseButton = page.getByTestId('welcome-wizard-Window-close');
	await wizardCloseButton.click();
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
			case 'warning':
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

export async function openGlobalSettings(page: Page): Promise<void> {
	return await test.step('Open global settings', async () => {
		await page.getByTestId('menu-button').click();
		await page.getByTestId('menu-item-settings').click();
	});
}

/**
 * Helper function to navigate to a specific settings section
 * @param page - The Playwright page object
 * @param section - The settings section to navigate to
 */
export async function navigateToSettingsSection(page: Page, section: 'General' | 'Notifications' | 'Appearance'): Promise<void> {
	return await test.step(`Navigate to settings section: ${section}`, async () => {
		await page.getByTestId(`settings-${section.toLowerCase()}`).click();
	});
}

export async function goToRootSettingsSection(page: Page): Promise<void> {
	return await test.step('Navigate back to root settings', async () => {
		await page.getByTestId('breadcrumb-settings').click();
	});
}

/**
 * Helper function to close the current window
 * @param page - The Playwright page object
 */
export async function closeWindow(page: Page, testId: string): Promise<void> {
	return await test.step('Close window', async () => {
		await page.getByTestId(testId + '-Window-close').click({});
	});
}

/**
 * Helper function to set up an account through the initial wizard
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
export async function setupAccountInWizard(
	page: Page,
	accountData: {
		server: string;
		address: string;
		password: string;
		title?: string;
	}
): Promise<void> {
	return await test.step(`Setup account in wizard: ${accountData.address}`, async () => {
		await page.getByTestId('wizard-next').waitFor({ state: 'visible' });
		await page.getByTestId('wizard-next').click();
		await page.getByTestId('account-title-input').click();
		await page.getByTestId('account-title-input').fill(accountData.title || '');
		await page.getByTestId('account-server-input').press('Shift+Home');
		await page.getByTestId('account-server-input').fill(accountData.server);
		await page.getByTestId('account-address-input').fill(accountData.address);
		await page.getByTestId('account-password-input').fill(accountData.password);
		await page.getByTestId('add').click();
		await page.screenshot({ path: '/tmp/setup_account_in_wizard.png' });
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Finish' }).click();
	});
}

/**
 * Helper function to add a new account
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
export async function addAccount(
	page: Page,
	accountData: {
		server: string;
		address: string;
		password: string;
		title?: string;
	}
): Promise<void> {
	return await test.step(`Add new account: ${accountData.address}`, async () => {
		await page.getByTestId('add-account-button').click();

		// Clear and fill the fields
		await page.getByTestId('account-title-input').fill(accountData.title || '');
		await page.getByTestId('account-server-input').fill(accountData.server);
		await page.getByTestId('account-address-input').fill(accountData.address);
		await page.getByTestId('account-password-input').fill(accountData.password);
		await page.getByTestId('add').click();
	});
}

/**
 * Helper function to switch to a module only if it's not already selected
 * @param page - The Playwright page object
 * @param moduleId - The module ID to switch to
 */
export async function switchModule(page: Page, moduleId: string): Promise<void> {
	return await test.step(`Switch to module: ${moduleId}`, async () => {
		const moduleSelector = page.getByTestId(`ModuleBarItem-${moduleId}`);
		const selectedElement = moduleSelector.locator('div.selected');

		// Wait for module selector to be ready
		await moduleSelector.waitFor({ state: 'visible' });

		// Check if module is already selected
		let isSelected = (await selectedElement.count()) > 0;

		// Only click if not already selected
		if (!isSelected) {
			await moduleSelector.click();
			// Wait a bit for the click to process
			await page.waitForTimeout(500);

			// Check again if now selected
			isSelected = (await selectedElement.count()) > 0;

			// If still not selected, try one more time
			if (!isSelected) {
				await moduleSelector.click();
				await page.waitForTimeout(500);
			}
		}
	});
}

/**
 * Helper function to switch to a specific account
 * @param page - The Playwright page object
 * @param address - The account address to switch to
 */
export async function switchAccount(page: Page, address: string): Promise<void> {
	return await test.step(`Switch to account: ${address}`, async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account ' + address).click();
	});
}

/**
 * Helper function to navigate to account management
 * @param page - The Playwright page object
 */
export async function goToAccountManagement(page: Page): Promise<void> {
	return await test.step('Go to account management', async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
	});
}
