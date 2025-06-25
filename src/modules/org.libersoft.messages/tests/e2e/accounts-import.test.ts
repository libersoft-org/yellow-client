import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { enableConsoleLogging } from '@/lib/test-utils/playwright-console.ts';

/**
 * Helper function to navigate to account management
 * @param page - The Playwright page object
 */
async function goToAccountManagement(page: Page): Promise<void> {
	return await test.step('Go to account management', async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByRole('button', { name: 'Account management Account' }).click();
	});
}

/**
 * Helper function to open accounts import modal
 * @param page - The Playwright page object
 */
async function openImportModal(page: Page): Promise<void> {
	return await test.step('Open accounts import modal', async () => {
		await page.getByRole('button', { name: 'Import' }).click();
	});
}

/**
 * Helper function to fill import text area with JSON data
 * @param page - The Playwright page object
 * @param jsonData - The JSON data to import
 */
async function fillImportData(page: Page, jsonData: string): Promise<void> {
	return await test.step('Fill import data', async () => {
		await page.getByTestId('accounts-textarea').fill(jsonData);
	});
}

/**
 * Helper function to click Add accounts button
 * @param page - The Playwright page object
 */
async function clickAddAccounts(page: Page): Promise<void> {
	return await test.step('Click Add accounts button', async () => {
		await page.getByTestId('accounts-add-btn').click();
	});
}

/**
 * Helper function to click Replace All button
 * @param page - The Playwright page object
 */
async function clickReplaceAll(page: Page): Promise<void> {
	return await test.step('Click Replace All button', async () => {
		await page.getByTestId('accounts-replace-btn').click();
	});
}

/**
 * Helper function to confirm replace action in dialog
 * @param page - The Playwright page object
 */
async function confirmReplaceDialog(page: Page): Promise<void> {
	return await test.step('Confirm replace in dialog', async () => {
		await page.getByTestId('confirm-replace-btn').click();
	});
}

/**
 * Helper function to close the import modal
 * @param page - The Playwright page object
 */
async function closeImportModal(page: Page): Promise<void> {
	return await test.step('Close import modal', async () => {
		await page.getByRole('button', { name: 'X', exact: true }).click();
	});
}

/**
 * Helper function to wait for and check error message
 * @param page - The Playwright page object
 * @param expectedError - The expected error message (partial match)
 */
async function expectErrorMessage(page: Page, expectedError: string): Promise<void> {
	return await test.step(`Expect error message: ${expectedError}`, async () => {
		// Wait for the Alert component to show the error
		await expect(page.locator('.alert')).toContainText(expectedError, { timeout: 5000 });
	});
}

/**
 * Helper function to setup an account through the initial wizard
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
async function setupAccountInWizard(
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
		await page.getByRole('textbox', { name: 'Title:' }).click();
		await page.getByRole('textbox', { name: 'Title:' }).fill(accountData.title || '');
		await page.getByRole('textbox', { name: 'Server:' }).press('Shift+Home');
		await page.getByRole('textbox', { name: 'Server:' }).fill(accountData.server);
		await page.getByRole('textbox', { name: 'Address:' }).fill(accountData.address);
		await page.getByRole('textbox', { name: 'Password:' }).fill(accountData.password);
		await page.getByTestId('add').click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Finish' }).click();
	});
}

/**
 * Valid account configurations for testing
 */
const validAccountConfigs = [
	{
		id: 'test-account-1',
		enabled: true,
		credentials: {
			server: 'ws://localhost:8084',
			address: 'test1@example.com',
			password: 'password123',
		},
		settings: {},
	},
	{
		id: 'test-account-2',
		enabled: false,
		credentials: {
			server: 'ws://localhost:8085',
			address: 'test2@example.com',
			password: '', // Empty password is valid
		},
		settings: { theme: 'dark' },
	},
];

test.describe('Accounts Import Functionality', () => {
	const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || 'ws://localhost:8084';

	test.beforeEach(async ({ page }) => {
		// Setup console logging (controlled by PLAYWRIGHT_CONSOLE_LOG env var)
		enableConsoleLogging(page);

		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

		// Setup initial account via wizard
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'initial@example.com',
			password: 'initialpass',
		});
	});

	test('Successfully import valid accounts using Add accounts', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const validJson = JSON.stringify(validAccountConfigs);
		await fillImportData(page, validJson);
		await clickAddAccounts(page);

		// Should close modal automatically on success
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible({ timeout: 5000 });

		// Verify accounts were added by checking the account list
		await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).toBeVisible();
		await expect(page.getByTestId('account-address@test2@example.com@ws://localhost:8085')).toBeVisible();
	});

	test('Successfully replace all accounts using Replace All', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const validJson = JSON.stringify(validAccountConfigs);
		await fillImportData(page, validJson);
		await clickReplaceAll(page);
		await confirmReplaceDialog(page);

		// Should close modal automatically on success
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible({ timeout: 5000 });

		// Verify old account is gone and new accounts are present
		await expect(page.getByTestId(`account-address@initial@example.com@${serverUrl}`)).not.toBeVisible();
		await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).toBeVisible();
		await expect(page.getByTestId('account-address@test2@example.com@ws://localhost:8085')).toBeVisible();
	});

	test('Reject invalid JSON format', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const invalidJson = '{ invalid json format }';
		await fillImportData(page, invalidJson);
		await clickAddAccounts(page);

		await expectErrorMessage(page, 'Invalid JSON format');
	});

	test('Reject non-array data', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const nonArrayJson = JSON.stringify({ notAnArray: true });
		await fillImportData(page, nonArrayJson);
		await clickAddAccounts(page);

		await expectErrorMessage(page, 'Import data must be an array of accounts');
	});

	test('Reject empty array', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const emptyArrayJson = JSON.stringify([]);
		await fillImportData(page, emptyArrayJson);
		await clickAddAccounts(page);

		await expectErrorMessage(page, 'No accounts found in import data');
	});

	test('Reject accounts missing required fields', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const invalidAccounts = [
			{
				// Missing id, enabled, credentials, settings
			},
			{
				id: 'test-2',
				enabled: true,
				credentials: {
					// Missing server, address, password
				},
				settings: {},
			},
		];

		const invalidJson = JSON.stringify(invalidAccounts);
		await fillImportData(page, invalidJson);
		await clickAddAccounts(page);

		await expectErrorMessage(page, 'Account 1: Account must have a valid id');
	});

	test('Reject accounts with invalid credential fields', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const invalidAccounts = [
			{
				id: 'test-1',
				enabled: true,
				credentials: {
					server: '', // Empty server
					address: 'test@example.com',
					password: 'password',
				},
				settings: {},
			},
			{
				id: 'test-2',
				enabled: true,
				credentials: {
					server: 'ws://localhost:8084',
					address: '', // Empty address
					password: 'password',
				},
				settings: {},
			},
		];

		const invalidJson = JSON.stringify(invalidAccounts);
		await fillImportData(page, invalidJson);
		await clickAddAccounts(page);

		await expectErrorMessage(page, 'Credentials must have server (string)');
	});

	test('Reject accounts with non-string password', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const invalidAccounts = [
			{
				id: 'test-1',
				enabled: true,
				credentials: {
					server: 'ws://localhost:8084',
					address: 'test@example.com',
					password: 123, // Invalid type - should be string
				},
				settings: {},
			},
		];

		const invalidJson = JSON.stringify(invalidAccounts);
		await fillImportData(page, invalidJson);
		await clickAddAccounts(page);

		await expectErrorMessage(page, 'Credentials must have password (string)');
	});

	test('Handle mix of valid and invalid accounts - show detailed error', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const mixedAccounts = [
			validAccountConfigs[0], // Valid
			{
				id: 'invalid-1',
				enabled: true,
				credentials: {
					server: '', // Invalid - empty server
					address: 'invalid@example.com',
					password: 'password',
				},
				settings: {},
			},
			{
				// Invalid - missing required fields
				enabled: true,
			},
			validAccountConfigs[1], // Valid
		];

		const mixedJson = JSON.stringify(mixedAccounts);
		await fillImportData(page, mixedJson);
		await clickAddAccounts(page);

		// Should show detailed error message listing all validation failures
		await expectErrorMessage(page, 'Account 2: Credentials must have server (string)');
		await expectErrorMessage(page, 'Account 3: Account must have a valid id');
	});

	test('Handle duplicate accounts during Add accounts - show conflict dialog', async ({ page }) => {
		// First, add an account normally
		await goToAccountManagement(page);
		await page.getByRole('button', { name: 'Add a new account Add a new' }).click();
		await page.getByRole('textbox', { name: 'Server:' }).fill('ws://localhost:8084');
		await page.getByRole('textbox', { name: 'Address:' }).fill('duplicate@example.com');
		await page.getByRole('textbox', { name: 'Password:' }).fill('password');
		await page.getByTestId('add').click();

		// Now try to import the same account
		await openImportModal(page);
		const duplicateAccount = [
			{
				id: 'duplicate-account',
				enabled: true,
				credentials: {
					server: 'ws://localhost:8084',
					address: 'duplicate@example.com',
					password: 'newpassword',
				},
				settings: {},
			},
		];

		const duplicateJson = JSON.stringify(duplicateAccount);
		await fillImportData(page, duplicateJson);
		await clickAddAccounts(page);

		// Should show conflict dialog
		await expect(page.getByText('Account with address "duplicate@example.com" on server "ws://localhost:8084" is already configured. What would you like to do?')).toBeVisible({ timeout: 5000 });

		// Test "Skip" option
		await page.getByTestId('skip-btn').click();

		// Wait a bit for any async operations
		await page.waitForTimeout(1000);

		// Check if modal is still visible
		const modalVisible = await page.getByTestId('accounts-import-Modal').isVisible();
		//console.log('Modal still visible after skip:', modalVisible);

		// Should show error that no accounts were imported
		await expectErrorMessage(page, 'No accounts were imported');
	});

	test('Handle duplicate accounts - replace existing option', async ({ page }) => {
		// First, add an account normally
		await goToAccountManagement(page);
		await page.getByRole('button', { name: 'Add a new account Add a new' }).click();
		await page.getByRole('textbox', { name: 'Server:' }).fill('ws://localhost:8084');
		await page.getByRole('textbox', { name: 'Address:' }).fill('replace@example.com');
		await page.getByRole('textbox', { name: 'Password:' }).fill('oldpassword');
		await page.getByTestId('add').click();

		// Now try to import the same account with different settings
		await openImportModal(page);
		const replaceAccount = [
			{
				id: 'replace-account',
				enabled: false, // Different enabled state
				credentials: {
					server: 'ws://localhost:8084',
					address: 'replace@example.com',
					password: 'newpassword', // Different password
				},
				settings: { theme: 'dark' }, // Different settings
			},
		];

		const replaceJson = JSON.stringify(replaceAccount);
		await fillImportData(page, replaceJson);
		await clickAddAccounts(page);

		// Should show conflict dialog
		await expect(page.getByText('Account with address "replace@example.com" on server "ws://localhost:8084" is already configured. What would you like to do?')).toBeVisible({ timeout: 5000 });

		// Test "Replace existing" option
		await page.getByTestId('replace-existing-btn').click();

		// Modal should close on success
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible({ timeout: 5000 });

		// Verify the account was replaced (should show updated settings)
		await expect(page.getByTestId('account-address@replace@example.com@ws://localhost:8084')).toBeVisible();
	});

	test('Replace All with invalid JSON shows proper error', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const invalidJson = '{ broken json';
		await fillImportData(page, invalidJson);
		await clickReplaceAll(page);

		await expectErrorMessage(page, 'Invalid JSON format');
	});

	test('Replace All with invalid account data shows proper error', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const invalidAccounts = [
			{
				id: 'test-1',
				enabled: 'not-a-boolean', // Invalid type
				credentials: {
					server: 'ws://localhost:8084',
					address: 'test@example.com',
					password: 'password',
				},
				settings: {},
			},
		];

		const invalidJson = JSON.stringify(invalidAccounts);
		await fillImportData(page, invalidJson);
		await clickReplaceAll(page);

		await expectErrorMessage(page, 'Account must have enabled field (boolean)');
	});

	test('Cancel Replace All dialog', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const validJson = JSON.stringify(validAccountConfigs);
		await fillImportData(page, validJson);
		await clickReplaceAll(page);

		// Cancel the replace dialog
		await page.getByTestId('cancel-replace-btn').click();

		// Verify original account still exists
		await closeImportModal(page);
		await expect(page.getByTestId(`account-address@initial@example.com@${serverUrl}`)).toBeVisible();
		await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).not.toBeVisible();
	});

	test('Import accounts with special characters and edge cases', async ({ page }) => {
		await goToAccountManagement(page);
		await openImportModal(page);

		const specialAccounts = [
			{
				id: 'special-chars-тест-🚀',
				enabled: true,
				credentials: {
					server: 'wss://тест.example.com:8084',
					address: 'user+tag@münchen.example.com',
					password: 'пароль123!@#$%^&*()',
				},
				settings: {
					'special-key': 'special-value',
					'unicode-тест': '测试',
				},
			},
		];

		const specialJson = JSON.stringify(specialAccounts);
		await fillImportData(page, specialJson);
		await clickAddAccounts(page);

		// Should close modal automatically on success
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible({ timeout: 5000 });

		// Verify account was added
		await expect(page.getByTestId('account-address@user+tag@münchen.example.com@wss://тест.example.com:8084')).toBeVisible();
	});
});
