import { type Page } from '@playwright/test';
import QRCode from 'qrcode';

/**
 * Waits for QR scanner to detect the mocked QR code
 * @param page - Playwright page
 * @param expectedData - Expected QR code data to be detected
 * @param timeout - Timeout in milliseconds (default 10000)
 */
export async function waitForQRDetection(page: Page, expectedData: string, timeout = 10000): Promise<void> {
	// Add some debugging to see what elements exist
	await page.evaluate(() => {
		const qrResult = document.querySelector('[data-testid="accounts-qr-result"]');
		const textarea = document.querySelector('[data-testid="accounts-textarea"]');
		const addBtn = document.querySelector('[data-testid="accounts-add-btn"]');

		console.log('QR Detection: accounts-qr-result exists:', !!qrResult, qrResult?.textContent?.substring(0, 50));
		console.log('QR Detection: accounts-textarea exists:', !!textarea, (textarea as HTMLTextAreaElement)?.value?.substring(0, 50));
		console.log('QR Detection: accounts-add-btn exists:', !!addBtn, (addBtn as HTMLElement)?.style.display);

		// List all data-testid elements for debugging
		const testIdElements = document.querySelectorAll('[data-testid]');
		console.log(
			'QR Detection: Available testid elements:',
			Array.from(testIdElements).map(el => el.getAttribute('data-testid'))
		);
	});
}

/**
 * Mocks canvas getImageData to return QR code data
 * @param page - Playwright page
 * @param qrData - String data to encode in QR code
 */
// export async function mockQRScanner(page: Page, qrData: string): Promise<void> {
// 	await page.addInitScript(
// 		({ data, size }) => {
// 			// Import QRCode library in browser context
// 			const script = document.createElement('script');
// 			script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
// 			document.head.appendChild(script);
//
// 			script.onload = () => {
// 				// Generate QR code ImageData
// 				(window as any).QRCode.toDataURL(data, {
// 					width: size,
// 					margin: 2,
// 					color: {
// 						dark: '#000000',
// 						light: '#FFFFFF',
// 					},
// 				}).then((qrDataUrl: string) => {
// 					const canvas = document.createElement('canvas');
// 					const ctx = canvas.getContext('2d')!;
// 					const img = new Image();
//
// 					img.onload = () => {
// 						canvas.width = size;
// 						canvas.height = size;
// 						ctx.drawImage(img, 0, 0, size, size);
// 						const qrImageData = ctx.getImageData(0, 0, size, size);
//
// 						// Store the QR ImageData for mocking
// 						(window as any).__qrTestImageData = qrImageData;
//
// 						// Mock canvas getImageData method
// 						const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
// 						CanvasRenderingContext2D.prototype.getImageData = function (sx, sy, sw, sh) {
// 							// If this looks like a QR scanner canvas request, return our mock data
// 							if ((window as any).__qrTestImageData && sw > 100 && sh > 100) {
// 								return (window as any).__qrTestImageData;
// 							}
// 							// Otherwise use original method
// 							return originalGetImageData.call(this, sx, sy, sw, sh);
// 						};
// 					};
//
// 					img.src = qrDataUrl;
// 				});
// 			};
// 		},
// 		{ data: qrData, size: 300 }
// 	);
//
// 	// Wait for QR code generation to complete
// 	await page.waitForFunction(() => (window as any).__qrTestImageData !== undefined, { timeout: 5000 });
// }

/**
 * Simulates a QR code scan by continuously drawing real QR code to canvas
 * @param page - Playwright page
 * @param qrData - String data to encode in QR code
 */
export async function simulateQRScan(page: Page, qrData: string): Promise<void> {
	// Generate QR code data URL using the existing qrcode library
	const qrDataUrl = await QRCode.toDataURL(qrData, {
		width: 1600,
		height: 1200,
		margin: 10,
		color: { dark: '#111122', light: '#cceeee' },
	});

	// Try to grant camera permissions only in supported environments
	if (process.env.CI !== 'true') {
		try {
			await page.context().grantPermissions(['camera'], { origin: page.url() });
		} catch {
			// Permission manipulation failed, continue without it
		}
	}

	// Set mock video flag and continuously draw QR code to override camera stream
	await page.evaluate(dataUrl => {
		console.log('QR Mock: Starting QR code injection with data URL length:', dataUrl.length);

		// Enable mock video mode for the application
		(window as any).doMockVideo = true;
		console.log('QR Mock: Set doMockVideo = true');

		// Load the QR image
		const qrImage = new Image();
		qrImage.src = dataUrl;

		// Function to draw QR code onto all canvas elements
		const drawQRCode = () => {
			const canvases = document.querySelectorAll('canvas');
			console.log('QR Mock: Found', canvases.length, 'canvas elements');

			// Debug: log info about each canvas
			canvases.forEach((canvas, index) => {
				console.log(`QR Mock: Canvas ${index}:`, {
					width: canvas.width,
					height: canvas.height,
					className: canvas.className,
					testId: canvas.dataset.testid,
					visible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0,
					rect: canvas.getBoundingClientRect(),
				});
			});

			let drewToCanvases = 0;
			for (const canvas of Array.from(canvases)) {
				if (canvas.width > 0 && canvas.height > 0) {
					const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
					if (ctx) {
						// Draw QR code centered on canvas
						//ctx.fillStyle = "#0f0";
						//ctx.fillRect(0, 0, canvas.width,canvas.height);
						ctx.imageSmoothingEnabled = false; // crucial
						ctx.imageSmoothingQuality = 'low';

						ctx.drawImage(qrImage, 5, 5, canvas.width - 50, canvas.height - 50);
						drewToCanvases++;

						// Get canvas data after drawing for debugging
						const canvasDataUrl = canvas.toDataURL('image/png');

						// Check if canvas content is being overwritten
						setTimeout(() => {
							const canvasAfterDelay = canvas.toDataURL('image/png');
							if (canvasAfterDelay !== canvasDataUrl) {
								console.warn('QR Mock: Canvas content changed after drawing - camera stream is overwriting our QR code');
							}
						}, 10);

						// Also append an image tag after the canvas for visual debugging (only once)
						/*if (!canvas.dataset.debugImageAdded) {
							const debugImg = document.createElement('img');
							debugImg.src = canvasDataUrl;
							debugImg.style.cssText = 'display: block; width: 150px; height: 150px; border: 1px solid #ccc; margin: 10px 0; opacity: 0.8;';
							debugImg.title = 'QR Mock Debug Image';
							canvas.parentNode?.insertBefore(debugImg, canvas.nextSibling);
							canvas.dataset.debugImageAdded = 'true';
						}*/

						console.log('QR Mock: Drew QR code to canvas', canvas.width + 'x' + canvas.height, 'and saved image + debug img');
					}
				}
			}

			if (drewToCanvases === 0) {
				console.warn('QR Mock: No suitable canvas elements found for drawing');
			}
		};

		// Wait for image to load, then start continuous drawing
		qrImage.onload = () => {
			console.log('QR Mock: QR image loaded successfully, starting continuous drawing');
			// Draw immediately and then every 50ms to continuously override camera stream
			drawQRCode();
			(window as any).__qrDrawInterval = setInterval(drawQRCode, 50);
		};

		qrImage.onerror = () => {
			console.error('QR Mock: Failed to load QR image');
		};
	}, qrDataUrl);
}

/**
 * Cleans up QR scanner mocking
 * @param page - Playwright page
 */
export async function cleanupQRMocking(page: Page): Promise<void> {
	await page.evaluate(() => {
		// Clear the QR drawing interval
		if ((window as any).__qrDrawInterval) {
			clearInterval((window as any).__qrDrawInterval);
			delete (window as any).__qrDrawInterval;
		}
		// Reset any mock data
		delete (window as any).__qrTestImageData;
	});
}
