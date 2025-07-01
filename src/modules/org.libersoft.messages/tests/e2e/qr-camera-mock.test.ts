import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardModal } from '@/core/e2e/test-utils.ts';
import { QRTestHelper } from '../../../../../test-assets/qr-test-helper.js';

/**
 * Helper function to setup initial account via wizard
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

test.describe.parallel('QR Code Camera Mock Tests', () => {
	const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || 'ws://localhost:8084';

	test.beforeEach(async ({ page }) => {
		// Setup console logging
		setupConsoleLogging(page);

		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

		// Setup initial account via wizard
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'initial@example.com',
			password: 'initialpass',
		});
	});

	test('QR scanner interface with mock camera displays correctly', async ({ page, browserName }, testInfo) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
		test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video not available in Mobile Safari');
		const helper = new QRTestHelper(page);
		await helper.setupQRTesting();

		// Navigate to QR import
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Should show scanner interface elements
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		await expect(page.locator('video')).toBeVisible();

		// Wait for video to be ready (mock camera should work)
		await helper.waitForQRScanner();

		// Should not show camera error with mock setup
		await expect(page.getByText('Camera access denied or not available')).not.toBeVisible();
	});

	/*	test('Successfully scan and import valid account QR code', async ({ page }) => {
		const result = await testQRImportFlow(page, QR_TEST_DATA.VALID_ACCOUNT, 'success');
		expect(result.success).toBe(true);

		// Import the scanned data
		await page.getByTestId('accounts-add-btn').click();

		// Should close modal and show imported account
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible();
		// Assuming QR code imports to ws://localhost:8084 by default
		await expect(page.getByTestId('account-address@qrtest1@example.com@ws://localhost:8084')).toBeVisible();
	});

	test('Successfully scan and import complex account QR code', async ({ page }) => {
		const result = await testQRImportFlow(page, QR_TEST_DATA.COMPLEX_ACCOUNT, 'success');
		expect(result.success).toBe(true);

		// Import the scanned data
		await page.getByTestId('accounts-add-btn').click();

		// Should close modal and show imported account
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible();
		// Assuming QR code imports to ws://localhost:8084 by default
		await expect(page.getByTestId('account-address@complex+test@example.com@ws://localhost:8084')).toBeVisible();
	});

	test('Handle invalid JSON in QR code scan', async ({ page }) => {
		const result = await testQRImportFlow(page, QR_TEST_DATA.INVALID_JSON, 'error');
		expect(result.success).toBe(false);

		// Should show error for invalid JSON
		await expect(page.getByText('Invalid JSON format')).toBeVisible();
	});

	test('Handle non-account data in QR code scan', async ({ page }) => {
		const result = await testQRImportFlow(page, QR_TEST_DATA.SIMPLE_TEXT, 'error');
		expect(result.success).toBe(false);

		// Should show error for non-JSON data
		await expect(page.locator('.alert')).toBeVisible();
	});

	test('Successfully scan and import multiple accounts QR code', async ({ page }) => {
		const result = await testQRImportFlow(page, QR_TEST_DATA.MULTIPLE_ACCOUNTS, 'success');
		expect(result.success).toBe(true);

		// Import the scanned data
		await page.getByTestId('accounts-add-btn').click();

		// Should close modal and show imported accounts
		await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible();
		// Assuming QR code imports to ws://localhost:8084 by default
		await expect(page.getByTestId('account-address@user1@domain.com@ws://localhost:8084')).toBeVisible();
		await expect(page.getByTestId('account-address@user2@domain.com@ws://localhost:8084')).toBeVisible();
	});

	test('Scan again functionality works correctly', async ({ page }) => {
		const helper = new QRTestHelper(page);
		await helper.setupQRTesting();

		// Navigate to QR import and scan first QR code
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Wait for scanner and inject first QR data
		await helper.waitForQRScanner(QR_TEST_DATA.VALID_ACCOUNT);

		// Should show scanned content
		await expect(page.getByTestId('accounts-add-btn')).toBeVisible();

		// Click "Scan Again" button
		await page.getByRole('button', { name: 'Scan Again' }).click();

		// Should show scanner interface again
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		await expect(page.locator('video')).toBeVisible();

		// Scan different QR code
		await helper.waitForQRScanner(QR_TEST_DATA.COMPLEX_ACCOUNT);

		// Should show new scanned content
		await expect(page.getByTestId('accounts-add-btn')).toBeVisible();

		// Verify the data has changed
		const codeElement = page.locator('[data-testid="accounts-textarea"]');
		const scannedData = await codeElement.inputValue();
		expect(scannedData).toContain('complex+test@example.com');
	});
*/
	test('Switch between JSON and QR tabs maintains state', async ({ page, browserName }, testInfo) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
		test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video not available in Mobile Safari');
		const helper = new QRTestHelper(page);
		await helper.setupQRTesting();

		// Navigate to accounts import
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();

		// Start on JSON tab and enter some data
		const jsonData = JSON.stringify([{ test: 'data' }]);
		await page.getByTestId('accounts-textarea').fill(jsonData);

		// Switch to QR tab
		await page.getByTestId('accounts-qr-tab').click();
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();

		// Switch back to JSON tab
		await page.getByTestId('accounts-json-tab').click();

		// JSON data should still be there
		const codeElement = page.locator('[data-testid="accounts-textarea"]');
		const preservedData = await codeElement.inputValue();
		expect(preservedData).toBe(jsonData);
	});

	/*test('QR scanning with immediate success detection', async ({ page }) => {
		const helper = new QRTestHelper(page);
		await helper.setupQRTesting();

		// Pre-inject QR data before navigation
		await helper.injectQRCode(QR_TEST_DATA.VALID_ACCOUNT);

		// Navigate to QR import
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Should quickly detect and show the QR content
		await expect(page.getByTestId('accounts-add-btn')).toBeVisible({  });

		// Verify the detected content
		const codeElement = page.locator('[data-testid="accounts-textarea"]');
		const detectedData = await codeElement.inputValue();
		expect(detectedData).toContain('qrtest1@example.com');
	});*/
});
