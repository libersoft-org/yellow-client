import { type Page } from '@playwright/test';

/**
 * Waits for QR scanner to detect the mocked QR code
 * @param page - Playwright page
 * @param expectedData - Expected QR code data to be detected
 * @param timeout - Timeout in milliseconds (default 10000)
 */
export async function waitForQRDetection(page: Page, expectedData: string, timeout = 10000): Promise<void> {
	await page.waitForFunction(
		data => {
			// Check if QR scanner has detected our data (using accounts import QR scanner testId)
			const codeElement = document.querySelector('[data-testid="accounts-qr-result"]');
			return codeElement && codeElement.textContent?.includes(data);
		},
		expectedData,
		{ timeout }
	);
}

/**
 * Mocks canvas getImageData to return QR code data
 * @param page - Playwright page
 * @param qrData - String data to encode in QR code
 */
export async function mockQRScanner(page: Page, qrData: string): Promise<void> {
	await page.addInitScript(
		({ data, size }) => {
			// Import QRCode library in browser context
			const script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
			document.head.appendChild(script);

			script.onload = () => {
				// Generate QR code ImageData
				(window as any).QRCode.toDataURL(data, {
					width: size,
					margin: 2,
					color: {
						dark: '#000000',
						light: '#FFFFFF',
					},
				}).then((qrDataUrl: string) => {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d')!;
					const img = new Image();

					img.onload = () => {
						canvas.width = size;
						canvas.height = size;
						ctx.drawImage(img, 0, 0, size, size);
						const qrImageData = ctx.getImageData(0, 0, size, size);

						// Store the QR ImageData for mocking
						(window as any).__qrTestImageData = qrImageData;

						// Mock canvas getImageData method
						const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
						CanvasRenderingContext2D.prototype.getImageData = function (sx, sy, sw, sh) {
							// If this looks like a QR scanner canvas request, return our mock data
							if ((window as any).__qrTestImageData && sw > 100 && sh > 100) {
								return (window as any).__qrTestImageData;
							}
							// Otherwise use original method
							return originalGetImageData.call(this, sx, sy, sw, sh);
						};
					};

					img.src = qrDataUrl;
				});
			};
		},
		{ data: qrData, size: 300 }
	);

	// Wait for QR code generation to complete
	await page.waitForFunction(() => (window as any).__qrTestImageData !== undefined, { timeout: 5000 });
}

/**
 * Simulates a QR code scan by triggering the mocked canvas data
 * @param page - Playwright page
 * @param qrData - String data to encode in QR code
 */
export async function simulateQRScan(page: Page, qrData: string): Promise<void> {
	// Setup QR code mocking
	await mockQRScanner(page, qrData);

	// Grant camera permissions so scanner starts
	await page.context().grantPermissions(['camera'], { origin: page.url() });
}

/**
 * Cleans up QR scanner mocking
 * @param page - Playwright page
 */
export async function cleanupQRMocking(page: Page): Promise<void> {
	await page.evaluate(() => {
		// Reset canvas getImageData to original
		delete (window as any).__qrTestImageData;
		// Note: We can't easily restore the original getImageData method,
		// but this is acceptable for test isolation
	});
}
