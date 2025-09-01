import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { setupConsoleLogging } from '@/core/tests/e2e/test-utils.ts';
import { simulateQRScan, waitForQRDetection, cleanupQRMocking } from '@/core/tests/e2e/qr-test-utils.ts';

test.describe.parallel('QR Code Import Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Setup console logging (controlled by PLAYWRIGHT_CONSOLE_LOG env var)
		setupConsoleLogging(page);

		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');
		const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || 'ws://localhost:8084';

		// Setup initial account via wizard
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'initial@example.com',
			password: 'initialpass',
		});
	});

	test('Handle camera access denied', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'Mobile Safari', 'Only test camera denial on Mobile Safari where it commonly occurs');

		// Mock camera denial by not granting camera permissions and overriding getUserMedia
		await page.context().grantPermissions([], { origin: page.url() });

		// Override getUserMedia to simulate camera denial
		await page.addInitScript(() => {
			Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
				writable: true,
				value: async () => {
					throw new Error('Permission denied');
				},
			});
		});

		await goToAccountManagement(page);
		await openImportWindow(page);
		await switchToQRImportTab(page);

		// Should show camera access error
		await expect(page.getByText('Camera access denied or not available')).toBeVisible();
	});

	test('QR code scanner interface elements', async ({ page, browserName }, testInfo) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
		test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video not available in Mobile Safari');

		// Grant camera permissions (fake camera should be available due to browser flags)
		await page.context().grantPermissions(['camera'], { origin: page.url() });

		await goToAccountManagement(page);
		await openImportWindow(page);
		await switchToQRImportTab(page);

		// Should show scanner interface
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		//await expect(page.locator('video')).toBeVisible();
	});

	test('QR code scanner interface works with fake camera', async ({ page, browserName }, testInfo) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
		test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video not available in Mobile Safari');

		// Grant camera permissions (fake camera should be available due to browser flags)
		await page.context().grantPermissions(['camera'], { origin: page.url() });

		await goToAccountManagement(page);
		await openImportWindow(page);
		await switchToQRImportTab(page);

		// Should see camera interface (fake camera should work now)
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		//await expect(page.locator('video')).toBeVisible();

		// Verify that camera scanning started (Canvas operations indicate QR scanning is active)
		// We should see no error messages about camera access
		await expect(page.getByText('Camera access denied or not available')).not.toBeVisible();
	});

	test('Successfully scan and import QR code with valid account data', async ({ page }) => {
		// Mock QR code data to be "scanned"
		const qrAccountData = JSON.stringify([
			{
				id: 'qr-scanned-account',
				/*enabled: true,
				credentials: {
					server: 'ws://localhost:8084',
					address: 'qr-scan@example.com',
					password: 'qrpassword123',
				},
				settings: {},*/
			},
		]);

		await goToAccountManagement(page);
		await openImportWindow(page);
		await switchToQRImportTab(page);

		// Setup QR code mocking and simulate scan
		await simulateQRScan(page, qrAccountData);

		// Should see camera interface and then detect our QR code
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		//await expect(page.locator('video')).toBeVisible();

		// Wait for QR detection to complete
		await waitForQRDetection(page, qrAccountData);

		// Should now show scanned QR result
		await expect(page.getByTestId('accounts-qr-result')).toBeVisible({ timeout: 30000 });
		await expect(page.getByTestId('accounts-qr-result')).toContainText('qr-scan@example.com');

		// Import the scanned data
		await page.getByTestId('accounts-add-btn').click();

		// Should close window and show imported account
		await expect(page.getByTestId('accounts-import-Window')).not.toBeVisible();
		await expect(page.getByTestId('account-address@qr-scan@example.com@ws://localhost:8084')).toBeVisible();

		// Cleanup QR mocking for other tests
		await cleanupQRMocking(page);
	});

	test('Handle invalid QR code data during scan', async ({ page }) => {
		// Mock invalid QR code data
		const invalidQrData = 'invalid json data';

		await goToAccountManagement(page);
		await openImportWindow(page);
		await switchToQRImportTab(page);

		// Setup QR code mocking with invalid data
		await simulateQRScan(page, invalidQrData);

		// Should see camera interface and then detect our invalid QR code
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		//await expect(page.locator('video')).toBeVisible();

		// Wait for QR detection to complete
		await waitForQRDetection(page, invalidQrData);

		// Should now show scanned QR result with invalid data
		await expect(page.getByTestId('accounts-qr-result')).toBeVisible();
		await expect(page.getByTestId('accounts-qr-result')).toContainText(invalidQrData);

		// Try to import the invalid data
		await page.getByTestId('accounts-add-btn').click();

		// Should show error for invalid JSON
		await expectErrorMessage(page, 'Invalid JSON format');

		// Cleanup QR mocking for other tests
		await cleanupQRMocking(page);
	});

	test('Scan again functionality after successful scan', async ({ page }) => {
		const firstQrData = JSON.stringify([{ id: 'first', enabled: true, credentials: { server: 'ws://test:8084', address: 'first@test.com', password: 'pass' }, settings: {} }]);

		await goToAccountManagement(page);
		await openImportWindow(page);
		await switchToQRImportTab(page);

		// Setup QR code mocking and simulate first scan
		await simulateQRScan(page, firstQrData);

		// Should see camera interface and then detect our QR code
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		//await expect(page.locator('video')).toBeVisible();

		// Wait for QR detection to complete
		await waitForQRDetection(page, firstQrData);

		// Should now show scanned QR result
		await expect(page.getByTestId('accounts-qr-result')).toBeVisible();
		await expect(page.getByTestId('accounts-qr-result')).toContainText('first@test.com');

		// Test "Scan again" functionality
		await page.getByTestId('accounts-qr-scan-again').click();

		// Should show scanner interface again
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		//await expect(page.locator('video')).toBeVisible();

		// Cleanup QR mocking for other tests
		await cleanupQRMocking(page);
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
 * Helper function to switch to QR code tab in import window
 * @param page - The Playwright page object
 */
async function switchToQRImportTab(page: Page): Promise<void> {
	return await test.step('Switch to QR Code import tab', async () => {
		await page.getByTestId('accounts-qr-tab').click();
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
