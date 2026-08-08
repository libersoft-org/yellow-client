import { type Page } from '@playwright/test';

/**
 * Universal QR code mocking utility for Playwright tests
 *
 * This utility works by setting test data that QRScanner components detect and use,
 * bypassing all camera/canvas/video stream issues in test environments.
 *
 * USAGE:
 * 1. Navigate to QR scanner page and wait for scanner to be visible
 * 2. Call mockQRCodeScan(page, qrData) to inject mock data
 * 3. Call disableQRMocking(page) to clean up after test
 *
 * WORKS WITH:
 * - Any component that uses QRScanner.svelte for QR code detection
 * - All test scenarios (valid data, invalid data, different formats)
 * - Multiple QR scanners on the same page
 * - Account import QR scanning, wallet payment QR scanning, etc.
 */

/**
 * Mock QR code scanning with specific data
 * Call this AFTER navigating to QR scanner pages and scanner is visible
 */
export async function mockQRCodeScan(page: Page, qrData: string): Promise<void> {
	await page.evaluate(data => {
		(window as any).__QR_TEST_DATA = data;
	}, qrData);
}

/**
 * Disable QR code mocking (allows real QR scanning)
 * Call this at the end of tests to clean up
 */
export async function disableQRMocking(page: Page): Promise<void> {
	await page.evaluate(() => {
		delete (window as any).__QR_TEST_DATA;
	});
}
