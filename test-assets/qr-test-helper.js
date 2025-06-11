import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced helper for testing QR code scanning with mock camera
 */
export class QRTestHelper {
	constructor(page) {
		this.page = page;
		this.qrImagesPath = path.join(__dirname, 'qr-codes');
	}

	/**
	 * Setup permissions and prepare for QR testing
	 */
	async setupQRTesting() {
		// Grant camera permissions
		await this.page.context().grantPermissions(['camera'], { origin: this.page.url() });

		// Add script to enhance fake camera with QR code pattern
		await this.page.addInitScript(() => {
			// Create a more realistic fake video stream
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = 640;
			canvas.height = 480;

			// Store original getUserMedia
			const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

			// Flag to control QR code injection
			window._mockQRCode = null;
			window._qrInjected = false;

			navigator.mediaDevices.getUserMedia = async constraints => {
				const stream = await originalGetUserMedia(constraints);

				if (constraints.video && window._mockQRCode) {
					// Replace video track with our canvas stream showing QR code
					const canvasStream = canvas.captureStream(30);
					const videoTrack = canvasStream.getVideoTracks()[0];

					// Replace the original video track
					stream.getVideoTracks().forEach(track => {
						stream.removeTrack(track);
					});
					stream.addTrack(videoTrack);

					// Draw QR code pattern on canvas
					window._drawQRPattern(ctx, canvas.width, canvas.height, window._mockQRCode);
				}

				return stream;
			};

			// Function to draw a mock QR code pattern
			window._drawQRPattern = (ctx, width, height, data) => {
				// Clear canvas
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, width, height);

				// Draw a simple QR-like pattern in the center
				const qrSize = Math.min(width, height) * 0.6;
				const startX = (width - qrSize) / 2;
				const startY = (height - qrSize) / 2;

				// Create QR-like pattern
				ctx.fillStyle = '#000000';
				const moduleSize = qrSize / 25; // 25x25 modules

				// Draw finder patterns (corners)
				const finderSize = moduleSize * 7;
				// Top-left finder
				ctx.fillRect(startX, startY, finderSize, finderSize);
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(startX + moduleSize, startY + moduleSize, finderSize - 2 * moduleSize, finderSize - 2 * moduleSize);
				ctx.fillStyle = '#000000';
				ctx.fillRect(startX + 2 * moduleSize, startY + 2 * moduleSize, finderSize - 4 * moduleSize, finderSize - 4 * moduleSize);

				// Top-right finder
				ctx.fillStyle = '#000000';
				ctx.fillRect(startX + qrSize - finderSize, startY, finderSize, finderSize);
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(startX + qrSize - finderSize + moduleSize, startY + moduleSize, finderSize - 2 * moduleSize, finderSize - 2 * moduleSize);
				ctx.fillStyle = '#000000';
				ctx.fillRect(startX + qrSize - finderSize + 2 * moduleSize, startY + 2 * moduleSize, finderSize - 4 * moduleSize, finderSize - 4 * moduleSize);

				// Bottom-left finder
				ctx.fillStyle = '#000000';
				ctx.fillRect(startX, startY + qrSize - finderSize, finderSize, finderSize);
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(startX + moduleSize, startY + qrSize - finderSize + moduleSize, finderSize - 2 * moduleSize, finderSize - 2 * moduleSize);
				ctx.fillStyle = '#000000';
				ctx.fillRect(startX + 2 * moduleSize, startY + qrSize - finderSize + 2 * moduleSize, finderSize - 4 * moduleSize, finderSize - 4 * moduleSize);

				// Add some random data pattern in the middle
				ctx.fillStyle = '#000000';
				for (let i = 8; i < 17; i++) {
					for (let j = 8; j < 17; j++) {
						if (Math.random() > 0.5) {
							ctx.fillRect(startX + i * moduleSize, startY + j * moduleSize, moduleSize, moduleSize);
						}
					}
				}

				// Store data for manual injection if needed
				window._qrData = data;
			};

			// Function to manually trigger QR detection (fallback)
			window._injectQRResult = data => {
				const event = new CustomEvent('mockQRDetected', { detail: data });
				document.dispatchEvent(event);
			};
		});
	}

	/**
	 * Inject specific QR code data for testing
	 * @param {string} qrData - The data that should be "scanned" from QR code
	 */
	async injectQRCode(qrData) {
		await this.page.evaluate(data => {
			window._mockQRCode = data;
		}, qrData);
	}

	/**
	 * Manually trigger QR detection (fallback method)
	 * @param {string} qrData - The data to inject as scanned result
	 */
	async triggerQRDetection(qrData) {
		await this.page.evaluate(data => {
			window._injectQRResult(data);
		}, qrData);
	}

	/**
	 * Wait for QR scanner to be ready and optionally inject data
	 * @param {string} qrData - Optional QR data to inject
	 * @param {number} timeout - Timeout in milliseconds
	 */
	async waitForQRScanner(qrData = null, timeout = 10000) {
		// Wait for video element to be present
		await this.page.waitForSelector('video', { timeout });

		// Wait for video to be ready
		await this.page.waitForFunction(
			() => {
				const video = document.querySelector('video');
				return video && video.readyState >= 2;
			},
			{ timeout }
		);

		// Small delay to ensure scanner is active
		await this.page.waitForTimeout(500);

		// Inject QR data if provided
		if (qrData) {
			await this.injectQRCode(qrData);

			// Wait a bit more for scanning to pick up our pattern
			await this.page.waitForTimeout(1500);

			// If automatic detection doesn't work, try manual injection
			try {
				await this.page.waitForSelector('[data-testid="accounts-add-btn"]', { timeout: 3000 });
			} catch (e) {
				console.log('Auto-detection failed, trying manual injection...');
				await this.triggerQRDetection(qrData);
				await this.page.waitForTimeout(500);
			}
		}
	}
}

/**
 * Enhanced test data
 */
export const QR_TEST_DATA = {
	VALID_ACCOUNT: JSON.stringify([
		{
			id: 'qr-test-account-1',
			enabled: true,
			credentials: {
				server: 'ws://localhost:8084',
				address: 'qrtest1@example.com',
				password: 'qrpassword123',
			},
			settings: {},
		},
	]),

	COMPLEX_ACCOUNT: JSON.stringify([
		{
			id: 'qr-complex-test',
			enabled: true,
			credentials: {
				server: 'wss://secure.example.com:8084',
				address: 'complex+test@example.com',
				password: 'complexPassword123!@#',
			},
			settings: {
				theme: 'dark',
				notifications: true,
			},
		},
	]),

	INVALID_JSON: '{ invalid json format }',

	SIMPLE_TEXT: 'Hello, this is a simple text QR code for basic testing!',

	MULTIPLE_ACCOUNTS: JSON.stringify([
		{
			id: 'multi-account-1',
			enabled: true,
			credentials: {
				server: 'ws://server1.example.com:8084',
				address: 'user1@domain.com',
				password: 'password1',
			},
			settings: {},
		},
		{
			id: 'multi-account-2',
			enabled: false,
			credentials: {
				server: 'ws://server2.example.com:8084',
				address: 'user2@domain.com',
				password: 'password2',
			},
			settings: { theme: 'dark' },
		},
	]),
};

/**
 * Helper function to test QR import flow
 * @param {import('@playwright/test').Page} page
 * @param {string} qrData
 * @param {string} expectedResult - 'success', 'error', or 'invalid'
 */
export async function testQRImportFlow(page, qrData, expectedResult = 'success') {
	return await test.step(`Test QR import with ${expectedResult} expected`, async () => {
		const helper = new QRTestHelper(page);
		await helper.setupQRTesting();

		// Navigate to accounts import
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
		await page.getByTestId('accounts-import-button').click();

		// Switch to QR tab
		await page.getByTestId('accounts-qr-tab').click();

		// Wait for scanner and inject QR data
		await helper.waitForQRScanner(qrData);

		if (expectedResult === 'success') {
			// Should show scanned content and import buttons
			await expect(page.getByTestId('accounts-add-btn')).toBeVisible({ timeout: 5000 });

			// Verify the scanned data is displayed
			const codeElement = page.locator('[data-testid="accounts-textarea"]');
			await expect(codeElement).toBeVisible();

			return { success: true, data: await codeElement.inputValue() };
		} else if (expectedResult === 'error' || expectedResult === 'invalid') {
			// For invalid data, we'll still see the add button but it should fail when clicked
			await expect(page.getByTestId('accounts-add-btn')).toBeVisible({ timeout: 5000 });

			// Try to import and expect error
			await page.getByTestId('accounts-add-btn').click();
			await expect(page.locator('.alert')).toBeVisible({ timeout: 3000 });

			return { success: false, error: 'Expected error occurred' };
		}

		return { success: false, error: 'Unexpected result' };
	});
}
