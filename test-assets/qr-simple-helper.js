import { test, expect } from '@playwright/test';

/**
 * Simple QR test helper that directly manipulates the QR scanning process
 */
export class SimpleQRHelper {
	constructor(page) {
		this.page = page;
	}

	/**
	 * Setup camera permissions and prepare QR scanner
	 */
	async setupQRScanning() {
		// Grant camera permissions
		await this.page.context().grantPermissions(['camera'], { origin: this.page.url() });
	}

	/**
	 * Navigate to QR scanner interface
	 */
	async navigateToQRScanner() {
		await this.page.getByTestId('account-bar-toggle').click();
		await this.page.getByTestId('account-management-button').click();
		await this.page.getByTestId('accounts-import-button').click();
		await this.page.getByTestId('accounts-qr-tab').click();
	}

	/**
	 * Wait for QR scanner to be ready
	 */
	async waitForScannerReady() {
		// Wait for video element to be present and ready
		await this.page.waitForSelector('video', {});
		await this.page.waitForFunction(() => {
			const video = document.querySelector('video');
			return video && video.readyState >= 2;
		}, {});
	}

	/**
	 * Directly inject QR scan result by calling the processQRCode function
	 * @param {string} qrData - The data to simulate as scanned from QR code
	 */
	async simulateQRScan(qrData) {
		await this.page.evaluate(data => {
			// Find the component instance and call processQRCode directly
			// This simulates a successful QR code detection
			if (window.processQRCode) {
				window.processQRCode(data);
			} else {
				// Fallback: trigger the QR processing through the component's context
				const video = document.querySelector('video');
				if (video && video.closest) {
					// Try to find the Svelte component context
					const component = video.closest('[data-qr-scanner]');
					if (component && component._qrComponent) {
						component._qrComponent.processQRCode(data);
					}
				}

				// Alternative approach: dispatch a custom event that the scanner can listen to
				const event = new CustomEvent('mockQRDetected', {
					detail: { data: data },
					bubbles: true,
				});
				document.dispatchEvent(event);
			}
		}, qrData);
	}

	/**
	 * Alternative method: Manually switch to JSON tab and fill the data
	 * This simulates the result of a successful QR scan
	 * @param {string} qrData - The data to fill as if scanned
	 */
	async simulateQRScanViaJSON(qrData) {
		// Switch to JSON tab temporarily
		await this.page.getByTestId('accounts-json-tab').click();

		// Fill the textarea with QR data
		await this.page.getByTestId('accounts-textarea').fill(qrData);

		// Switch back to QR tab to show "scanned" state
		await this.page.getByTestId('accounts-qr-tab').click();

		// Wait a moment for UI to update
		await this.page.waitForTimeout(500);
	}

	/**
	 * Get the current scanner state
	 */
	async getScannerState() {
		return await this.page.evaluate(() => {
			const video = document.querySelector('video');
			const canvas = document.querySelector('canvas');
			const addBtn = document.querySelector('[data-testid="accounts-add-btn"]');

			return {
				hasVideo: !!video,
				videoReady: video && video.readyState >= 2,
				hasCanvas: !!canvas,
				hasAddButton: !!addBtn,
				videoSrc: video ? video.srcObject : null,
			};
		});
	}
}

/**
 * Test data for QR scanning
 */
export const SIMPLE_QR_DATA = {
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

	INVALID_JSON: '{ invalid json format }',

	EMPTY_ARRAY: JSON.stringify([]),

	NON_ARRAY: JSON.stringify({ notAnArray: true }),
};

/**
 * Simplified test flow for QR import
 * @param {import('@playwright/test').Page} page
 * @param {string} qrData
 * @param {string} expectedResult
 */
export async function simpleQRImportTest(page, qrData, expectedResult = 'success') {
	return await test.step(`Test QR import - ${expectedResult}`, async () => {
		const helper = new SimpleQRHelper(page);

		// Setup and navigate to QR scanner
		await helper.setupQRScanning();
		await helper.navigateToQRScanner();

		// Wait for scanner to be ready
		await helper.waitForScannerReady();

		// Check scanner state
		const state = await helper.getScannerState();
		console.log('Scanner state:', state);

		// Simulate QR scan using fallback method (JSON tab approach)
		await helper.simulateQRScanViaJSON(qrData);

		if (expectedResult === 'success') {
			// Should show import buttons
			await expect(page.getByTestId('accounts-add-btn')).toBeVisible();
			return { success: true };
		} else if (expectedResult === 'error') {
			// Should show import buttons but fail when clicked
			await expect(page.getByTestId('accounts-add-btn')).toBeVisible();
			await page.getByTestId('accounts-add-btn').click();

			// Should show error
			await expect(page.locator('.alert')).toBeVisible();
			return { success: true, error: 'Expected error occurred' };
		}

		return { success: false };
	});
}
