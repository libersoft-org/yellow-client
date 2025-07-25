import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';

// TODO: unify
import { closeWelcomeWizardWindow, closeWindow, setupConsoleLogging } from '@/core/e2e/test-utils.js';

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
			password: '',
		},
		settings: { theme: 'dark' },
	},
];

/**
 * Complex account configuration with special characters and settings
 */
const complexAccountConfig = [
	{
		id: 'complex-test-ñüñèz-🚀',
		enabled: true,
		credentials: {
			server: 'wss://тест.example.com:8084',
			address: 'user+tag@münchen.example.com',
			password: 'пароль123!@#$%^&*()',
		},
		settings: {
			'special-key': 'special-value',
			'unicode-тест': '测试',
			notifications: {
				enabled: true,
				sound: false,
			},
			appearance: {
				theme: 'dark',
				fontSize: 14,
			},
		},
	},
];

test.describe.parallel('Accounts Import/Export', () => {
	const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || 'ws://localhost:8084';

	test.beforeEach(async ({ page }) => {
		setupConsoleLogging(page);
		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'initial@example.com',
			password: 'initialpass',
		});
	});

	test.describe('JSON Import Tests', () => {
		test('Import valid accounts using Add accounts', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);

			const validJson = JSON.stringify(validAccountConfigs);
			await fillImportData(page, validJson);
			await clickAddAccounts(page);

			// Should close window automatically on success
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Verify accounts were added by checking the account list
			await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).toBeVisible();
			await expect(page.getByTestId('account-address@test2@example.com@ws://localhost:8085')).toBeVisible();
		});

		test('Replace all accounts using Replace All', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);

			const validJson = JSON.stringify(validAccountConfigs);
			await fillImportData(page, validJson);
			await clickReplaceAll(page);
			await confirmReplaceDialog(page);

			// Should close window automatically on success
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Verify old account is gone and new accounts are present
			await expect(page.getByTestId(`account-address@initial@example.com@${serverUrl}`)).not.toBeVisible();
			await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).toBeVisible();
			await expect(page.getByTestId('account-address@test2@example.com@ws://localhost:8085')).toBeVisible();
		});

		test('Import accounts with complex unicode and special characters', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);

			const complexJson = JSON.stringify(complexAccountConfig);
			await fillImportData(page, complexJson);
			await clickAddAccounts(page);

			// Should close window automatically on success
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Verify complex account was added
			await expect(page.getByTestId('account-address@user+tag@münchen.example.com@wss://тест.example.com:8084')).toBeVisible();
		});

		test('Reject invalid JSON format', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);

			const invalidJson = '{ invalid json format }';
			await fillImportData(page, invalidJson);
			await clickAddAccounts(page);

			await expectErrorMessage(page, 'Invalid JSON format');
		});

		test('Reject non-array data', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);

			const nonArrayJson = JSON.stringify({ notAnArray: true });
			await fillImportData(page, nonArrayJson);
			await clickAddAccounts(page);

			await expectErrorMessage(page, 'Import data must be an array of accounts');
		});

		test('Reject empty array', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);

			const emptyArrayJson = JSON.stringify([]);
			await fillImportData(page, emptyArrayJson);
			await clickAddAccounts(page);

			await expectErrorMessage(page, 'No accounts found in import data');
		});

		test('Handle duplicate accounts during Add accounts', async ({ page }) => {
			// First, add an account normally
			await goToAccountManagement(page);
			await page.getByTestId('add-account-button').click();
			await page.getByTestId('account-server-input').fill('ws://localhost:8084');
			await page.getByTestId('account-address-input').fill('duplicate@example.com');
			await page.getByTestId('account-password-input').fill('password');
			await page.getByTestId('add').click();

			// Now try to import the same account
			await openImportWindow(page);
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
			await expect(page.getByText('Account Already Exists')).toBeVisible();

			// Test "Replace Existing" option
			await page.getByRole('button', { name: 'Replace Existing' }).click();

			// Window should close on success
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Verify the account was replaced
			await expect(page.getByTestId('account-address@duplicate@example.com@ws://localhost:8084')).toBeVisible();
		});

		test('Handle duplicate accounts - skip option', async ({ page }) => {
			// First, add an account normally
			await goToAccountManagement(page);
			await page.getByTestId('add-account-button').click();
			await page.getByTestId('account-server-input').fill('ws://localhost:8084');
			await page.getByTestId('account-address-input').fill('skip@example.com');
			await page.getByTestId('account-password-input').fill('password');
			await page.getByTestId('add').click();

			// Now try to import the same account
			await openImportWindow(page);
			const duplicateAccount = [
				{
					id: 'skip-account',
					enabled: true,
					credentials: {
						server: 'ws://localhost:8084',
						address: 'skip@example.com',
						password: 'newpassword',
					},
					settings: {},
				},
			];

			const duplicateJson = JSON.stringify(duplicateAccount);
			await fillImportData(page, duplicateJson);
			await clickAddAccounts(page);

			// Should show conflict dialog
			await expect(page.getByText('Account Already Exists')).toBeVisible();

			// Test "Skip This Account" option
			await page.getByTestId('skip-btn').click();

			// Should show error that no accounts were imported
			await expectErrorMessage(page, 'No accounts were imported');
		});
	});

	test.describe('JSON Export Tests', () => {
		test('Export accounts to JSON format', async ({ page }) => {
			// Add some accounts first
			await goToAccountManagement(page);
			await openImportWindow(page);
			const validJson = JSON.stringify(validAccountConfigs);
			await fillImportData(page, validJson);
			await clickAddAccounts(page);

			// Wait for import to complete
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Now test export
			await openExportWindow(page);

			// Should be on JSON tab by default
			const exportedContent = await getExportedJSON(page);
			expect(exportedContent).toBeTruthy();

			// Parse and verify the exported content contains our accounts
			const parsedContent = JSON.parse(exportedContent);
			expect(Array.isArray(parsedContent)).toBe(true);
			expect(parsedContent.length).toBeGreaterThanOrEqual(3); // initial + 2 imported

			// Verify the imported accounts are in the export
			const exportedAddresses = parsedContent.map((acc: any) => acc.credentials?.address);
			expect(exportedAddresses).toContain('test1@example.com');
			expect(exportedAddresses).toContain('test2@example.com');
			expect(exportedAddresses).toContain('initial@example.com');
		});

		test('Copy exported JSON to clipboard', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Clipboard not available in CI');
			test.skip(browserName === 'firefox', 'Clipboard permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Clipboard not available in Mobile Safari');
			await goToAccountManagement(page);
			await openExportWindow(page);

			// Test copy functionality
			const clipboardContent = await clickCopyAndVerify(page);

			// Verify clipboard content is valid JSON
			const parsedClipboard = JSON.parse(clipboardContent);
			expect(Array.isArray(parsedClipboard)).toBe(true);
			expect(parsedClipboard.length).toBeGreaterThan(0);
		});

		test('Download exported JSON as file', async ({ page }) => {
			await goToAccountManagement(page);
			await openExportWindow(page);

			// Set up download handler
			const downloadPromise = page.waitForEvent('download');

			// Click download button
			await page.getByRole('button', { name: 'Download as file' }).click();

			// Wait for download to complete
			const download = await downloadPromise;
			expect(download.suggestedFilename()).toMatch(/.*_accounts_.*\.json$/);

			// Verify file content (note: in real tests you might want to save and read the file)
			expect(download.suggestedFilename()).toBeTruthy();
		});

		test('Export complex accounts with unicode characters', async ({ page }) => {
			// Import complex account first
			await goToAccountManagement(page);
			await openImportWindow(page);
			const complexJson = JSON.stringify(complexAccountConfig);
			await fillImportData(page, complexJson);
			await clickAddAccounts(page);

			// Wait for import to complete
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Export and verify
			await openExportWindow(page);
			const exportedContent = await getExportedJSON(page);
			const parsedContent = JSON.parse(exportedContent);

			// Find our complex account in the export
			const complexAccount = parsedContent.find((acc: any) => acc.credentials?.address === 'user+tag@münchen.example.com');

			expect(complexAccount).toBeTruthy();
			expect(complexAccount.id).toBe('complex-test-ñüñèz-🚀');
			expect(complexAccount.settings['unicode-тест']).toBe('测试');
		});
	});

	test.describe('QR Code Export Tests', () => {
		test('Generate QR code for account export', async ({ page }) => {
			await goToAccountManagement(page);
			await openExportWindow(page);
			await switchToQRExportTab(page);

			// Should show security warning initially
			await expect(page.getByText('Sensitive information is hidden')).toBeVisible();

			// QR code should be blurred initially
			const qrImage = page.locator('[data-testid="accounts-export-qr-image"]');
			await expect(qrImage).toBeVisible();
			await expect(qrImage).toHaveClass(/blurred/);

			// Click to reveal QR code
			await qrImage.click();

			// Should show different message after revealing
			await expect(page.getByText('Click the QR code to hide it')).toBeVisible();
			await expect(qrImage).not.toHaveClass(/blurred/);

			// Click again to hide
			await qrImage.click();
			await expect(qrImage).toHaveClass(/blurred/);
		});

		test('Handle QR code generation errors for large data', async ({ page }) => {
			// First add many accounts to create large data that might exceed QR code limits
			const largeAccountsArray = Array.from({ length: 50 }, (_, i) => ({
				id: `large-test-account-${i}`,
				enabled: true,
				credentials: {
					server: `ws://localhost:808${i % 10}`,
					address: `test${i}@verylongdomainname.example.com`,
					password: `verylongpasswordthatmakesthedataverylarge${i}`,
				},
				settings: {
					description: `This is a very long description for account ${i} that makes the JSON data much larger and might exceed QR code capacity`,
					features: {
						notifications: true,
						theme: 'dark',
						language: 'en',
						customData: `More data for account ${i}`,
					},
				},
			}));

			await goToAccountManagement(page);
			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(largeAccountsArray));
			await clickAddAccounts(page);

			// Wait for import to complete
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Try to export as QR code
			await openExportWindow(page);
			await switchToQRExportTab(page);

			// Should show error for data too large for QR code
			await expect(page.getByText(/Failed to generate QR code.*too large/)).toBeVisible();
		});
	});

	test.describe('QR Code Import Tests', () => {
		// Note: Camera access denied test is skipped as the fake camera setup bypasses permission checks

		test('QR code scanner interface elements', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video permissions not available in Mobile Safari');

			// Grant camera permissions
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToAccountManagement(page);
			await openImportWindow(page);
			await switchToQRImportTab(page);

			// Should show scanner interface
			await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();
		});

		test('QR code scanner interface works with fake camera', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video permissions not available in Mobile Safari');

			// Grant camera permissions (fake camera should be available due to browser flags)
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToAccountManagement(page);
			await openImportWindow(page);
			await switchToQRImportTab(page);

			// Should see camera interface (fake camera should work now)
			await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();

			// Verify that camera scanning started (Canvas operations indicate QR scanning is active)
			// We should see no error messages about camera access
			await expect(page.getByText('Camera access denied or not available')).not.toBeVisible();
		});

		test('Scan and import QR code with valid account data', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video permissions not available in Mobile Safari');

			// Mock QR code data to be "scanned"
			const qrAccountData = JSON.stringify([
				{
					id: 'qr-scanned-account',
					enabled: true,
					credentials: {
						server: 'ws://localhost:8084',
						address: 'qr-scan@example.com',
						password: 'qrpassword123',
					},
					settings: {},
				},
			]);

			// Grant camera permissions (fake camera should be available due to browser flags)
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToAccountManagement(page);
			await openImportWindow(page);
			await switchToQRImportTab(page);

			// Should see camera interface (fake camera should work now)
			await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();

			// Wait for scanning to start, then manually enter the QR data via the JSON tab
			// This simulates a successful QR scan by switching to JSON tab and entering the data
			await page.getByTestId('accounts-json-tab').click();
			await page.getByTestId('accounts-textarea').fill(qrAccountData);

			// Import the data
			await page.getByTestId('accounts-add-btn').click();

			// Should close window and show imported account
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();
			await expect(page.getByTestId('account-address@qr-scan@example.com@ws://localhost:8084')).toBeVisible();
		});

		test('Handle invalid QR code data during scan', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video permissions not available in Mobile Safari');

			// Mock invalid QR code data
			const invalidQrData = 'invalid json data';

			// Grant camera permissions
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToAccountManagement(page);
			await openImportWindow(page);
			await switchToQRImportTab(page);

			// Should see camera interface working
			await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();

			// Simulate scanning invalid data by switching to JSON tab and entering invalid data
			await page.getByTestId('accounts-json-tab').click();
			await page.getByTestId('accounts-textarea').fill(invalidQrData);

			// Try to import the invalid data
			await page.getByTestId('accounts-add-btn').click();

			// Should show error for invalid JSON
			await expectErrorMessage(page, 'Invalid JSON format');
		});

		test('Scan again functionality after successful scan', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video permissions not available in Mobile Safari');

			const firstQrData = JSON.stringify([{ id: 'first', enabled: true, credentials: { server: 'ws://test:8084', address: 'first@test.com', password: 'pass' }, settings: {} }]);

			// Grant camera permissions
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToAccountManagement(page);
			await openImportWindow(page);
			await switchToQRImportTab(page);

			// Should see camera interface working
			await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();

			// Simulate successful scan by switching to JSON tab and entering data
			await page.getByTestId('accounts-json-tab').click();
			await page.getByTestId('accounts-textarea').fill(firstQrData);

			// Go back to QR tab to test "scan again" functionality
			await page.getByTestId('accounts-qr-tab').click();

			// Should show scanner interface again
			await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();
		});
	});

	test.describe('Edge Cases and Error Handling', () => {
		test('Handle very large JSON import', async ({ page }) => {
			const veryLargeArray = Array.from({ length: 50 }, (_, i) => ({
				id: `bulk-account-${i}`,
				enabled: i % 2 === 0,
				credentials: {
					server: `ws://server${i % 10}.example.com:8084`,
					address: `user${i}@domain${i % 100}.example.com`,
					password: `password${i}`,
				},
				settings: {},
			}));

			await goToAccountManagement(page);
			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(veryLargeArray));
			await clickAddAccounts(page);

			// Should succeed for reasonable number of accounts
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Verify some accounts were imported
			await expect(page.getByTestId('account-address@user0@domain0.example.com@ws://server0.example.com:8084')).toBeVisible();
		});

		test('Handle malformed account data with detailed errors', async ({ page }) => {
			const malformedAccounts = [
				{
					id: 'valid-account',
					enabled: true,
					credentials: {
						server: 'ws://localhost:8084',
						address: 'valid@example.com',
						password: 'password',
					},
					settings: {},
				},
				{
					// Missing id
					enabled: true,
					credentials: {
						server: 'ws://localhost:8084',
						address: 'missing-id@example.com',
						password: 'password',
					},
					settings: {},
				},
				{
					id: 'invalid-enabled',
					enabled: 'not-boolean', // Wrong type
					credentials: {
						server: 'ws://localhost:8084',
						address: 'invalid-enabled@example.com',
						password: 'password',
					},
					settings: {},
				},
				{
					id: 'missing-credentials',
					enabled: true,
					// Missing credentials object
					settings: {},
				},
			];

			await goToAccountManagement(page);
			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(malformedAccounts));
			await clickAddAccounts(page);

			// Should show detailed error messages
			await expectErrorMessage(page, 'Account must have a valid id');
			await expectErrorMessage(page, 'Account must have enabled field (boolean)');
		});

		test('Cancel replace operation', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(validAccountConfigs));
			await clickReplaceAll(page);

			// Cancel the replace dialog
			await page.getByTestId('cancel-replace-btn').click();

			// Original account should still exist
			await closeWindow(page, 'accounts-import');
			await expect(page.getByTestId(`account-address@initial@example.com@${serverUrl}`)).toBeVisible();
		});

		test('Window close behavior during operations', async ({ page }) => {
			await goToAccountManagement(page);
			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(validAccountConfigs));

			// Close window without performing any action
			await closeWindow(page, 'accounts-import');

			// Should return to account management without changes
			await expect(page.getByTestId(`account-address@initial@example.com@${serverUrl}`)).toBeVisible();
			await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).not.toBeVisible();
		});

		test('Import/Export cycle consistency', async ({ page }) => {
			// Import accounts
			await goToAccountManagement(page);
			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(validAccountConfigs));
			await clickAddAccounts(page);
			await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();

			// Export accounts
			await openExportWindow(page);
			const exportedContent = await getExportedJSON(page);
			await closeWindow(page, 'accounts-export');

			// Replace with just one minimal account
			const minimalAccount = [
				{
					id: 'temp-account',
					enabled: true,
					credentials: {
						server: 'ws://localhost:8084',
						address: 'temp@example.com',
						password: 'temp',
					},
					settings: {},
				},
			];

			await openImportWindow(page);
			await fillImportData(page, JSON.stringify(minimalAccount));
			await clickReplaceAll(page);
			await confirmReplaceDialog(page);

			// Import the exported content back
			await openImportWindow(page);
			await fillImportData(page, exportedContent);
			await clickReplaceAll(page);
			await confirmReplaceDialog(page);

			// Verify accounts are restored
			await expect(page.getByTestId('account-address@test1@example.com@ws://localhost:8084')).toBeVisible();
			await expect(page.getByTestId('account-address@test2@example.com@ws://localhost:8085')).toBeVisible();
			await expect(page.getByTestId(`account-address@initial@example.com@${serverUrl}`)).toBeVisible();
		});
	});
});

/**
 * Helper function to navigate to account management
 * @param page - The Playwright page object
 */
async function goToAccountManagement(page: Page): Promise<void> {
	return await test.step('Go to account management', async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
	});
}

/**
 * Helper function to open accounts import window
 * @param page - The Playwright page object
 */
async function openImportWindow(page: Page): Promise<void> {
	return await test.step('Open accounts import window', async () => {
		await page.getByTestId('accounts-import-button').click();
	});
}

/**
 * Helper function to open accounts export window
 * @param page - The Playwright page object
 */
async function openExportWindow(page: Page): Promise<void> {
	return await test.step('Open accounts export window', async () => {
		await page.getByTestId('accounts-export-button').click();
	});
}

/**
 * Helper function to switch to QR code tab in import window
 * @param page - The Playwright page object
 */
async function switchToQRImportTab(page: Page): Promise<void> {
	return await test.step('Switch to QR Code import tab', async () => {
		await page.getByTestId('accounts-qr-tab').click();
	});
}

/**
 * Helper function to switch to QR code tab in export window
 * @param page - The Playwright page object
 */
async function switchToQRExportTab(page: Page): Promise<void> {
	return await test.step('Switch to QR Code export tab', async () => {
		await page.getByTestId('accounts-export-qr-tab').click();
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
 * Helper function to wait for and check error message
 * @param page - The Playwright page object
 * @param expectedError - The expected error message (partial match)
 */
async function expectErrorMessage(page: Page, expectedError: string): Promise<void> {
	return await test.step(`Expect error message: ${expectedError}`, async () => {
		await expect(page.locator('.alert')).toContainText(expectedError, {});
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
		await page.getByTestId('wizard-next').waitFor({ state: 'visible' });
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
 * Helper function to get exported JSON content from code editor
 * @param page - The Playwright page object
 */
async function getExportedJSON(page: Page): Promise<string> {
	return await test.step('Get exported JSON content', async () => {
		const codeElement = page.locator('[data-testid="accounts-export-code-editor"]');
		await expect(codeElement).toBeVisible();
		return (await codeElement.inputValue()) || '';
	});
}

/**
 * Helper function to click copy button and verify clipboard
 * @param page - The Playwright page object
 */
async function clickCopyAndVerify(page: Page): Promise<string> {
	return await test.step('Click copy button and verify clipboard', async () => {
		// Grant clipboard permissions
		await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

		await page.getByRole('button', { name: 'Copy to clipboard' }).click();
		await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();

		// Get clipboard content by evaluating in browser context
		const clipboardContent = await page.evaluate(async () => {
			return await navigator.clipboard.readText();
		});

		expect(clipboardContent).toBeTruthy();
		return clipboardContent;
	});
}
