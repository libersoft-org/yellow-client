import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { enableConsoleLogging } from '@/lib/test-utils/playwright-console.ts';
import { QRVideoStreamHelper, QR_IMAGES, testQRImportWithImageStream } from '../../../../../test-assets/qr-video-stream-helper.js';

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

test.describe('QR Code Image Stream Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Setup console logging
		enableConsoleLogging(page);

		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');
		const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || 'ws://localhost:8084';

		// Setup initial account via wizard
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'initial@example.com',
			password: 'initialpass',
		});
	});

	test('Video stream with static QR image displays correctly', async ({ page }) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		const helper = new QRVideoStreamHelper(page);

		// Setup image-based video stream
		await helper.setupImageVideoStream(QR_IMAGES.VALID_ACCOUNT);

		// Navigate to QR scanner
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Wait for video to be ready
		await page.waitForSelector('video', { timeout: 10000 });
		await page.waitForFunction(
			() => {
				const video = document.querySelector('video');
				return video && video.readyState >= 2;
			},
			{ timeout: 10000 }
		);

		// Verify video stream properties
		const videoInfo = await helper.getVideoStreamInfo();
		expect(videoInfo.exists).toBe(true);
		expect(videoInfo.videoWidth).toBeGreaterThan(0);
		expect(videoInfo.videoHeight).toBeGreaterThan(0);
		expect(videoInfo.srcObject).toBe(true);

		// Should show scanner interface without errors
		await expect(page.getByText('Point your camera at a QR code')).toBeVisible();
		await expect(page.getByText('Camera access denied or not available')).not.toBeVisible();
	});

	test('Switch QR images for scan again functionality', async ({ page }) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		const helper = new QRVideoStreamHelper(page);

		// Setup initial video stream with first QR image
		await helper.setupImageVideoStream(QR_IMAGES.VALID_ACCOUNT);

		// Navigate to QR scanner
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Wait for video to be ready
		await page.waitForSelector('video', { timeout: 10000 });
		await page.waitForFunction(
			() => {
				const video = document.querySelector('video');
				return video && video.readyState >= 2;
			},
			{ timeout: 10000 }
		);

		// Verify initial video stream is working
		const videoInfo = await helper.getVideoStreamInfo();
		expect(videoInfo.exists).toBe(true);
		expect(videoInfo.srcObject).toBe(true);

		// Simulate switching to a different QR code (like user pointing camera at different code)
		await helper.switchToQRImage(QR_IMAGES.COMPLEX_ACCOUNT);
		await page.waitForTimeout(1000);

		// Video should still be working after image switch
		const videoInfo2 = await helper.getVideoStreamInfo();
		expect(videoInfo2.exists).toBe(true);
		expect(videoInfo2.srcObject).toBe(true);
	});

	test('QR detection with valid account image stream', async ({ page }) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		const result = await testQRImportWithImageStream(page, QR_IMAGES.VALID_ACCOUNT, 'qrtest1@example.com', true);

		expect(result.success).toBe(true);
		expect(result.videoWorking).toBe(true);

		// If auto-detection worked, verify the import
		if (result.autoDetected && !result.importFailed) {
			// Should close modal and show imported account
			await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible({ timeout: 5000 });
			await expect(page.getByRole('cell', { name: 'qrtest1@example.com' })).toBeVisible();
		}
	});

	test('QR detection with complex account image stream', async ({ page }) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		const result = await testQRImportWithImageStream(page, QR_IMAGES.COMPLEX_ACCOUNT, 'complex+test@example.com', true);

		expect(result.success).toBe(true);
		expect(result.videoWorking).toBe(true);

		// If auto-detection worked, verify the import
		if (result.autoDetected && !result.importFailed) {
			await expect(page.getByTestId('accounts-import-Modal')).not.toBeVisible({ timeout: 5000 });
			await expect(page.getByRole('cell', { name: 'complex+test@example.com' })).toBeVisible();
		}
	});

	test('QR detection with invalid data image stream', async ({ page }) => {
		test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
		const result = await testQRImportWithImageStream(page, QR_IMAGES.INVALID_DATA, 'invalid json', false);

		expect(result.success).toBe(true);
		expect(result.videoWorking).toBe(true);

		// If auto-detection worked, it should have failed to import
		if (result.autoDetected) {
			expect(result.importFailed).toBe(true);
		}
	});

	/*	test('Video stream performance and stability', async ({ page }) => {
		const helper = new QRVideoStreamHelper(page);

		// Setup image stream
		await helper.setupImageVideoStream(QR_IMAGES.VALID_ACCOUNT);

		// Navigate to QR scanner
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Wait for video to be ready
		await page.waitForSelector('video', { timeout: 10000 });

		// Check video performance over time
		const initialInfo = await helper.getVideoStreamInfo();
		expect(initialInfo.exists).toBe(true);

		// Wait and check again
		await page.waitForTimeout(3000);
		const laterInfo = await helper.getVideoStreamInfo();
		expect(laterInfo.exists).toBe(true);
		expect(laterInfo.playing).toBe(true);

		// Video time should have progressed
		expect(laterInfo.currentTime).toBeGreaterThan(initialInfo.currentTime);
	});
*/
	/*	test('Switch between tabs maintains video stream', async ({ page }) => {
		const helper = new QRVideoStreamHelper(page);

		// Setup image stream
		await helper.setupImageVideoStream(QR_IMAGES.VALID_ACCOUNT);

		// Navigate to accounts import
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();

		// Start on JSON tab
		await expect(page.getByTestId('accounts-json-tab')).toBeVisible();

		// Switch to QR tab - should start video
		await page.getByTestId('accounts-qr-tab').click();
		await page.waitForSelector('video', { timeout: 10000 });

		// Verify video is playing
		const videoInfo1 = await helper.getVideoStreamInfo();
		expect(videoInfo1.playing).toBe(true);

		// Switch back to JSON tab
		await page.getByTestId('accounts-json-tab').click();
		await page.waitForTimeout(500);

		// Switch back to QR tab again
		await page.getByTestId('accounts-qr-tab').click();
		await page.waitForTimeout(1000);

		// Video should still be working
		const videoInfo2 = await helper.getVideoStreamInfo();
		expect(videoInfo2.exists).toBe(true);
	});

	test('Multiple QR images in sequence', async ({ page }) => {
		const helper = new QRVideoStreamHelper(page);

		// Test with first image
		await helper.setupImageVideoStream(QR_IMAGES.VALID_ACCOUNT);

		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Wait for first video
		await page.waitForSelector('video', { timeout: 10000 });
		const info1 = await helper.getVideoStreamInfo();
		expect(info1.playing).toBe(true);

		// Close modal and try with different image
		await page.getByRole('button', { name: 'Cancel' }).click();

		// Setup different image stream
		await helper.setupImageVideoStream(QR_IMAGES.COMPLEX_ACCOUNT);

		// Navigate back to QR scanner
		await page.getByTestId('accounts-import-button').click();
		await page.getByTestId('accounts-qr-tab').click();

		// Should work with new image
		await page.waitForSelector('video', { timeout: 10000 });
		const info2 = await helper.getVideoStreamInfo();
		expect(info2.playing).toBe(true);
	});
	*/
});
