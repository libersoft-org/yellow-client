#!/usr/bin/env node

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test account data that should be scannable
const testAccountData = [
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
];

const complexAccountData = [
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
];

// Invalid JSON for error testing
const invalidData = '{ invalid json format }';

async function generateQRImages() {
	const outputDir = path.join(__dirname, 'qr-codes');

	// Ensure output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	console.log('Generating QR code test images...');

	try {
		// Generate valid account QR code
		const validAccountJSON = JSON.stringify(testAccountData);
		await QRCode.toFile(path.join(outputDir, 'valid-account.png'), validAccountJSON, {
			width: 400,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
		console.log('✓ Generated valid-account.png');

		// Generate complex account QR code
		const complexAccountJSON = JSON.stringify(complexAccountData);
		await QRCode.toFile(path.join(outputDir, 'complex-account.png'), complexAccountJSON, {
			width: 400,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
		console.log('✓ Generated complex-account.png');

		// Generate invalid data QR code for error testing
		await QRCode.toFile(path.join(outputDir, 'invalid-data.png'), invalidData, {
			width: 400,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
		console.log('✓ Generated invalid-data.png');

		// Generate a simple text QR code
		await QRCode.toFile(path.join(outputDir, 'simple-text.png'), 'Hello, this is a simple text QR code for basic testing!', {
			width: 400,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
		console.log('✓ Generated simple-text.png');

		// Generate a moderately large data QR code to test reasonable limits
		const moderateData = JSON.stringify(
			Array.from({ length: 3 }, (_, i) => ({
				id: `moderate-account-${i}`,
				enabled: true,
				credentials: {
					server: `ws://server${i}.example.com:8084`,
					address: `user${i}@domain${i}.example.com`,
					password: `password${i}`,
				},
				settings: {
					description: `Account ${i} description`,
					theme: 'dark',
					notifications: true,
				},
			}))
		);

		await QRCode.toFile(path.join(outputDir, 'moderate-data.png'), moderateData, {
			width: 500,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
		console.log('✓ Generated moderate-data.png');

		console.log(`\nAll QR code images generated successfully in: ${outputDir}`);

		// Output the test data for reference
		console.log('\nTest data references:');
		console.log('Valid account data:', validAccountJSON);
		console.log('Complex account data:', complexAccountJSON);
		console.log('Moderate data:', moderateData);
		console.log('Invalid data:', invalidData);
	} catch (error) {
		console.error('Error generating QR codes:', error);
		process.exit(1);
	}
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	generateQRImages();
}

export { generateQRImages, testAccountData, complexAccountData, invalidData };
