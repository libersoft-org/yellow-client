import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * Helper to configure mock camera with QR code images for Playwright tests
 */
export class QRCameraHelper {
	constructor(page) {
		this.page = page;
		this.qrImagesPath = join(__dirname, 'qr-codes');
	}

	/**
	 * Mock the camera to show a specific QR code image
	 * @param {string} qrImageName - Name of QR image file (without .png extension)
	 */
	async mockCameraWithQRCode(qrImageName) {
		const imagePath = join(this.qrImagesPath, `${qrImageName}.png`);

		// Override getUserMedia to provide a fake video stream with our QR code
		await this.page.addInitScript(imagePath => {
			// Create a canvas with the QR code image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = 640;
			canvas.height = 480;

			// Load and draw the QR code image
			const img = new Image();
			img.onload = () => {
				// Clear canvas and draw QR code centered
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				// Calculate centered position
				const qrSize = Math.min(canvas.width, canvas.height) * 0.8;
				const x = (canvas.width - qrSize) / 2;
				const y = (canvas.height - qrSize) / 2;

				ctx.drawImage(img, x, y, qrSize, qrSize);
			};

			// Convert image path to data URL for browser use
			img.src = imagePath;

			// Override getUserMedia
			const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
			navigator.mediaDevices.getUserMedia = async constraints => {
				if (constraints.video) {
					// Create a fake video stream from our canvas
					const stream = canvas.captureStream(30); // 30 FPS
					return stream;
				}
				return originalGetUserMedia(constraints);
			};
		}, imagePath);
	}

	/**
	 * Setup camera permissions for QR scanning tests
	 */
	async setupCameraPermissions() {
		await this.page.context().grantPermissions(['camera'], { origin: this.page.url() });
	}

	/**
	 * Helper to wait for QR scanning to detect and process our mock QR code
	 * @param {number} timeout - Timeout in milliseconds
	 */
	async waitForQRDetection(timeout = 10000) {
		// Wait for video element to be present and playing
		await this.page.waitForSelector('video', { timeout });

		// Wait for the QR scanning to process our image
		// This is a bit tricky - we need to wait for the jsQR library to detect our QR code
		await this.page.waitForFunction(
			() => {
				const video = document.querySelector('video');
				return video && video.readyState >= 2; // HAVE_CURRENT_DATA
			},
			{ timeout }
		);

		// Give the QR scanner a moment to process the frame
		await this.page.waitForTimeout(1000);
	}
}

/**
 * Test helper specifically for accounts import QR scanning
 */
export async function testQRImport(page, qrImageName, expectedResult = 'success') {
	const helper = new QRCameraHelper(page);

	// Setup camera with specific QR code
	await helper.setupCameraPermissions();
	await helper.mockCameraWithQRCode(qrImageName);

	// Navigate to accounts import and switch to QR tab
	await page.getByTestId('account-bar-toggle').click();
	await page.getByTestId('account-management-button').click();
	await page.getByTestId('accounts-import-button').click();
	await page.getByTestId('accounts-qr-tab').click();

	// Wait for QR scanning to detect our image
	await helper.waitForQRDetection();

	if (expectedResult === 'success') {
		// Should show scanned content and import buttons
		await page.waitForSelector('[data-testid="accounts-add-btn"]', { timeout: 5000 });
		return true;
	} else if (expectedResult === 'error') {
		// Should show error for invalid QR data
		await page.waitForSelector('.alert', { timeout: 5000 });
		return true;
	}

	return false;
}

export const QR_TEST_IMAGES = {
	VALID_ACCOUNT: 'valid-account',
	COMPLEX_ACCOUNT: 'complex-account',
	INVALID_DATA: 'invalid-data',
	SIMPLE_TEXT: 'simple-text',
	MODERATE_DATA: 'moderate-data',
};
