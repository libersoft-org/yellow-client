import { expect, type Page } from '@playwright/test';
import { test } from '@playwright/test';

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
			// Wait for module to load
			await page.waitForTimeout(1000);
		}
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

/**
 * Helper function to close any modal
 * @param page - The Playwright page object
 */
export async function closeModal(page: Page): Promise<void> {
	return await test.step('Close modal', async () => {
		await page.getByRole('button', { name: 'X', exact: true }).click();
	});
}

/**
 * Helper function to wait for and check error message
 * @param page - The Playwright page object
 * @param expectedError - The expected error message (partial match)
 */
export async function expectErrorMessage(page: Page, expectedError: string): Promise<void> {
	return await test.step(`Expect error message: ${expectedError}`, async () => {
		await expect(page.locator('.alert').filter({ hasText: expectedError })).toBeVisible({ timeout: 5000 });
	});
}

/**
 * Helper function to setup an account through the initial wizard
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
		await page.getByTestId('wizard-next').click();
		await page.getByTestId('account-title-input').click();
		await page.getByTestId('account-title-input').fill(accountData.title || '');
		await page.getByTestId('account-server-input').press('Shift+Home');
		await page.getByTestId('account-server-input').fill(accountData.server);
		await page.getByTestId('account-address-input').fill(accountData.address);
		await page.getByTestId('account-password-input').fill(accountData.password);
		await page.getByTestId('add').click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Finish' }).click();
	});
}

/**
 * Helper function to open global settings
 * @param page - The Playwright page object
 */
export async function openGlobalSettings(page: Page): Promise<void> {
	return await test.step('Open global settings', async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('settings-button').click();
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
	}
): Promise<void> {
	return await test.step(`Add account: ${accountData.address}`, async () => {
		await page.getByTestId('add-account-button').click();
		await page.getByTestId('account-server-input').fill(accountData.server);
		await page.getByTestId('account-address-input').fill(accountData.address);
		await page.getByTestId('account-password-input').fill(accountData.password);
		await page.getByTestId('add').click();
	});
}
