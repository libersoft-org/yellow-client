import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardModal } from '@/core/e2e/test-utils.ts';
import { switchModule, closeModal, expectErrorMessage } from '@/lib/test-utils/e2e-helpers.ts';

/**
 * Helper function to navigate to wallet and find networks import/export buttons
 * @param page - The Playwright page object
 */
async function goToNetworksManagement(page: Page): Promise<void> {
	return await test.step('Go to networks management', async () => {
		// The wallet module should already be selected from beforeEach
		// Click on the network dropdown to open "Select your network" modal
		await page.getByText('--- Select your network ---').click();

		// Wait for the modal to appear and click "Manage networks" button
		await page.getByRole('button', { name: 'Manage networks' }).click();

		// Wait for the networks management modal to be visible
		await page.getByTestId('networks-import-btn').waitFor({ state: 'visible', timeout: 5000 });
	});
}

/**
 * Helper function to open networks import modal
 * @param page - The Playwright page object
 */
async function openNetworksImportModal(page: Page): Promise<void> {
	return await test.step('Open networks import modal', async () => {
		await page.getByTestId('networks-import-btn').click();
	});
}

/**
 * Helper function to open networks export modal
 * @param page - The Playwright page object
 */
async function openNetworksExportModal(page: Page): Promise<void> {
	return await test.step('Open networks export modal', async () => {
		await page.getByTestId('networks-export-btn').click();
	});
}

/**
 * Helper function to switch to QR code tab in import modal
 * @param page - The Playwright page object
 */
async function switchToQRImportTab(page: Page): Promise<void> {
	return await test.step('Switch to QR Code import tab', async () => {
		await page.getByTestId('networks-qr-tab').click();
	});
}

/**
 * Helper function to switch to QR code tab in export modal
 * @param page - The Playwright page object
 */
async function switchToQRExportTab(page: Page): Promise<void> {
	return await test.step('Switch to QR Code export tab', async () => {
		await page.getByTestId('networks-export-qr-tab').click();
	});
}

/**
 * Helper function to fill import text area with JSON data
 * @param page - The Playwright page object
 * @param jsonData - The JSON data to import
 */
async function fillNetworksImportData(page: Page, jsonData: string): Promise<void> {
	return await test.step('Fill networks import data', async () => {
		await page.getByTestId('networks-textarea').fill(jsonData);
	});
}

/**
 * Helper function to click Add networks button
 * @param page - The Playwright page object
 */
async function clickAddNetworks(page: Page): Promise<void> {
	return await test.step('Click Add networks button', async () => {
		await page.getByTestId('networks-add-btn').click();
	});
}

/**
 * Helper function to click Replace All button
 * @param page - The Playwright page object
 */
async function clickReplaceAllNetworks(page: Page): Promise<void> {
	return await test.step('Click Replace All button', async () => {
		await page.getByTestId('networks-replace-btn').click();
	});
}

/**
 * Helper function to confirm replace action in dialog
 * @param page - The Playwright page object
 */
async function confirmReplaceNetworksDialog(page: Page): Promise<void> {
	return await test.step('Confirm replace in dialog', async () => {
		await page.getByTestId('confirm-replace-btn').click();
	});
}

/**
 * Helper function to get exported JSON content from code editor
 * @param page - The Playwright page object
 */
async function getExportedNetworksJSON(page: Page): Promise<string> {
	return await test.step('Get exported networks JSON content', async () => {
		const codeElement = page.locator('[data-testid="networks-export-code-editor"]');
		await expect(codeElement).toBeVisible();
		return (await codeElement.inputValue()) || '';
	});
}

/**
 * Valid network configurations for testing
 */
const validNetworkConfigs = [
	{
		guid: 'test-network-1',
		name: 'Test Network 1',
		chainID: 1337,
		currency: {
			symbol: 'TEST1',
			iconURL: 'https://example.com/test1.png',
		},
		rpcURLs: ['https://rpc1.test.example.com', 'https://rpc2.test.example.com'],
		tokens: [],
	},
	{
		guid: 'test-network-2',
		name: 'Test Network 2',
		chainID: 1338,
		currency: {
			symbol: 'TEST2',
			iconURL: 'https://example.com/test2.png',
		},
		rpcURLs: ['https://rpc.test2.example.com'],
		tokens: [
			{
				guid: 'token-1',
				icon: 'https://example.com/token1.png',
				symbol: 'TKN1',
				name: 'Test Token 1',
				contract_address: '0x1234567890123456789012345678901234567890',
			},
		],
	},
];

/**
 * Complex network configuration with special characters
 */
const complexNetworkConfig = [
	{
		guid: 'complex-test-ñüñèz-🚀',
		name: 'Test Network with Üñíçødé 测试',
		chainID: 9999,
		currency: {
			symbol: 'ÜTF8',
			iconURL: 'https://тест.example.com/üñíçødé.png',
		},
		rpcURLs: ['https://rpc-тест.example.com:8545', 'wss://ws-测试.example.com:8546'],
		tokens: [
			{
				guid: 'unicode-token-测试',
				icon: 'https://example.com/测试.png',
				symbol: '测试',
				name: 'Test Token 测试 with Üñíçødé',
				contract_address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
			},
		],
	},
];

test.describe('Networks Import/Export Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Setup console logging (controlled by PLAYWRIGHT_CONSOLE_LOG env var)
		setupConsoleLogging(page);

		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

		// Wait for the page to be ready
		await page.waitForLoadState('networkidle');

		// Close the wizard modal if it appears
		await closeWelcomeWizardModal(page);

		// Wait for module bar to be visible before switching
		await page.getByTestId(`ModuleBarItem-org.libersoft.wallet`).waitFor({ state: 'visible', timeout: 10000 });

		// Switch to wallet module
		await switchModule(page, 'org.libersoft.wallet');

		// Wait for wallet module to fully load
		await page.waitForTimeout(1000);
	});

	test.describe('JSON Import Tests', () => {
		test('Successfully import valid networks using Add networks', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const validJson = JSON.stringify(validNetworkConfigs);
			await fillNetworksImportData(page, validJson);
			await clickAddNetworks(page);

			// Should close modal automatically on success
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Verify networks were added by checking the network list
			await expect(page.getByTestId('network-name@Test Network 1')).toBeVisible();
			await expect(page.getByTestId('network-name@Test Network 2')).toBeVisible();
		});

		test('Successfully replace all networks using Replace All', async ({ page }) => {
			// First add some networks
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs));
			await clickAddNetworks(page);
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Now replace them
			await openNetworksImportModal(page);
			const replacementNetwork = [
				{
					guid: 'replacement-network',
					name: 'Replacement Network',
					chainID: 999,
					currency: {
						symbol: 'REPL',
						iconURL: 'https://example.com/replacement.png',
					},
					rpcURLs: ['https://replacement.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(replacementNetwork));
			await clickReplaceAllNetworks(page);
			await confirmReplaceNetworksDialog(page);

			// Should close modal automatically on success
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Verify old networks are gone and new network is present
			await expect(page.getByTestId('network-name@Test Network 1')).not.toBeVisible();
			await expect(page.getByTestId('network-name@Test Network 2')).not.toBeVisible();
			await expect(page.getByTestId('network-name@Replacement Network')).toBeVisible();
		});

		test('Import networks with complex unicode and special characters', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const complexJson = JSON.stringify(complexNetworkConfig);
			await fillNetworksImportData(page, complexJson);
			await clickAddNetworks(page);

			// Should close modal automatically on success
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Verify complex network was added
			await expect(page.getByTestId('network-name@Test Network with Üñíçødé 测试')).toBeVisible();
		});

		test('Reject invalid JSON format', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const invalidJson = '{ invalid json format }';
			await fillNetworksImportData(page, invalidJson);
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'Invalid JSON format');
		});

		test('Reject non-array data', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const nonArrayJson = JSON.stringify({ notAnArray: true });
			await fillNetworksImportData(page, nonArrayJson);
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'Data must be an array of networks');
		});

		test('Reject empty array', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const emptyArrayJson = JSON.stringify([]);
			await fillNetworksImportData(page, emptyArrayJson);
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'No networks were imported');
		});

		test('Handle duplicate networks during Add networks - Replace Existing', async ({ page }) => {
			// First, add a network
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs.slice(0, 1)));
			await clickAddNetworks(page);
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Now try to import a network with the same name
			await openNetworksImportModal(page);
			const duplicateNetwork = [
				{
					guid: 'duplicate-network',
					name: 'Test Network 1', // Same name as existing
					chainID: 9999,
					currency: {
						symbol: 'DUP',
						iconURL: 'https://example.com/duplicate.png',
					},
					rpcURLs: ['https://duplicate.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(duplicateNetwork));
			await clickAddNetworks(page);

			// Should show conflict dialog
			await expect(page.getByText('Network Already Exists')).toBeVisible({ timeout: 5000 });

			// Test "Replace Existing" option
			await page.getByRole('button', { name: 'Replace Existing' }).click();

			// Modal should close on success
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Verify the network was replaced (check for the new chainID or symbol)
			await expect(page.getByTestId('network-name@Test Network 1')).toBeVisible();
		});

		test('Handle duplicate networks - Import with Modified Name', async ({ page }) => {
			// First, add a network
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs.slice(0, 1)));
			await clickAddNetworks(page);
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Now try to import a network with the same name
			await openNetworksImportModal(page);
			const duplicateNetwork = [
				{
					guid: 'duplicate-network-2',
					name: 'Test Network 1', // Same name as existing
					chainID: 8888,
					currency: {
						symbol: 'DUP2',
						iconURL: 'https://example.com/duplicate2.png',
					},
					rpcURLs: ['https://duplicate2.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(duplicateNetwork));
			await clickAddNetworks(page);

			// Should show conflict dialog
			await expect(page.getByText('Network Already Exists')).toBeVisible({ timeout: 5000 });

			// Test "Import with Modified Name" option
			await page.getByRole('button', { name: 'Import with Modified Name' }).click();

			// Modal should close on success
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Verify both networks exist - original and one with modified name
			await expect(page.getByTestId('network-name@Test Network 1')).toBeVisible();
			await expect(page.getByTestId('network-name@Test Network 1 (1)')).toBeVisible();
		});

		test('Handle duplicate networks - Skip This Network', async ({ page }) => {
			// First, add a network
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs.slice(0, 1)));
			await clickAddNetworks(page);
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Now try to import the same network again
			await openNetworksImportModal(page);
			const duplicateNetwork = [
				{
					guid: 'duplicate-network-skip',
					name: 'Test Network 1', // Same name as existing
					chainID: 7777,
					currency: {
						symbol: 'SKIP',
						iconURL: 'https://example.com/skip.png',
					},
					rpcURLs: ['https://skip.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(duplicateNetwork));
			await clickAddNetworks(page);

			// Should show conflict dialog
			await expect(page.getByText('Network Already Exists')).toBeVisible({ timeout: 5000 });

			// Test "Skip This Network" option
			await page.getByRole('button', { name: 'Skip This Network' }).click();

			// Should show error that no networks were imported
			await expectErrorMessage(page, 'No networks were imported');
		});

		test('Validate network data structure - missing name', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const invalidNetwork = [
				{
					guid: 'invalid-no-name',
					// Missing name
					chainID: 1337,
					currency: {
						symbol: 'TEST',
						iconURL: 'https://example.com/test.png',
					},
					rpcURLs: ['https://rpc.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(invalidNetwork));
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'must have a valid name');
		});

		test('Validate network data structure - missing chainID', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const invalidNetwork = [
				{
					guid: 'invalid-no-chainid',
					name: 'Invalid Network',
					// Missing chainID
					currency: {
						symbol: 'TEST',
						iconURL: 'https://example.com/test.png',
					},
					rpcURLs: ['https://rpc.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(invalidNetwork));
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'must have a valid chainID');
		});

		test('Validate network data structure - missing rpcURLs', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const invalidNetwork = [
				{
					guid: 'invalid-no-rpc',
					name: 'Invalid Network',
					chainID: 1337,
					currency: {
						symbol: 'TEST',
						iconURL: 'https://example.com/test.png',
					},
					// Missing rpcURLs
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(invalidNetwork));
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'must have at least one RPC URL');
		});

		test('Validate network data structure - missing currency', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);

			const invalidNetwork = [
				{
					guid: 'invalid-no-currency',
					name: 'Invalid Network',
					chainID: 1337,
					// Missing currency
					rpcURLs: ['https://rpc.example.com'],
					tokens: [],
				},
			];

			await fillNetworksImportData(page, JSON.stringify(invalidNetwork));
			await clickAddNetworks(page);

			await expectErrorMessage(page, 'must have currency information');
		});
	});

	test.describe('JSON Export Tests', () => {
		test('Export networks to JSON format', async ({ page }) => {
			// Add some networks first
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			const validJson = JSON.stringify(validNetworkConfigs);
			await fillNetworksImportData(page, validJson);
			await clickAddNetworks(page);

			// Wait for import to complete
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Now test export
			await openNetworksExportModal(page);

			// Should be on JSON tab by default
			const exportedContent = await getExportedNetworksJSON(page);
			expect(exportedContent).toBeTruthy();

			// Parse and verify the exported content contains our networks
			const parsedContent = JSON.parse(exportedContent);
			expect(Array.isArray(parsedContent)).toBe(true);
			expect(parsedContent.length).toBeGreaterThanOrEqual(2); // imported networks

			// Verify the imported networks are in the export
			const exportedNames = parsedContent.map((net: any) => net.name);
			expect(exportedNames).toContain('Test Network 1');
			expect(exportedNames).toContain('Test Network 2');
		});

		test('Export complex networks with unicode characters', async ({ page }) => {
			// Import complex network first
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			const complexJson = JSON.stringify(complexNetworkConfig);
			await fillNetworksImportData(page, complexJson);
			await clickAddNetworks(page);

			// Wait for import to complete
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Export and verify
			await openNetworksExportModal(page);
			const exportedContent = await getExportedNetworksJSON(page);
			const parsedContent = JSON.parse(exportedContent);

			// Find our complex network in the export
			const complexNetwork = parsedContent.find((net: any) => net.name === 'Test Network with Üñíçødé 测试');

			expect(complexNetwork).toBeTruthy();
			expect(complexNetwork.guid).toBe('complex-test-ñüñèz-🚀');
			expect(complexNetwork.currency.symbol).toBe('ÜTF8');
			expect(complexNetwork.tokens[0].symbol).toBe('测试');
		});
	});

	test.describe('QR Code Export Tests', () => {
		test('Generate QR code for network export', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksExportModal(page);
			await switchToQRExportTab(page);

			// Should show security warning initially
			await expect(page.getByText('Sensitive information is hidden. Click the QR code to reveal it.')).toBeVisible();

			// QR code should be blurred initially
			const qrImage = page.locator('[data-testid="networks-export-qr-image"]');
			await expect(qrImage).toBeVisible();
			await expect(qrImage).toHaveClass(/blurred/);

			// Click to reveal QR code
			await qrImage.click();

			// Should show different message after revealing
			await expect(page.getByText('Click the QR code to hide it')).toBeVisible();
			await expect(qrImage).not.toHaveClass(/blurred/);

			// Click again to hide
			await qrImage.click();
			await expect(qrImage).toHaveClass(/blurred/);
		});
	});

	test.describe('QR Code Import Tests', () => {
		test('QR code scanner interface elements', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video not available in Mobile Safari');
			// Grant camera permissions
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await switchToQRImportTab(page);

			// Should show scanner interface
			await expect(page.getByText('Point your camera at a QR code containing network configuration')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();
		});

		test('Successfully scan and import QR code with valid network data', async ({ page, browserName }, testInfo) => {
			test.skip(process.env.CI === 'true', 'Camera/video not available in CI');
			test.skip(browserName === 'firefox', 'Camera/video permissions not supported in Firefox');
			test.skip(testInfo.project.name === 'Mobile Safari', 'Camera/video not available in Mobile Safari');
			// Mock QR code data to be "scanned"
			const qrNetworkData = JSON.stringify([
				{
					guid: 'qr-scanned-network',
					name: 'QR Scanned Network',
					chainID: 5555,
					currency: {
						symbol: 'QRS',
						iconURL: 'https://example.com/qr.png',
					},
					rpcURLs: ['https://qr-rpc.example.com'],
					tokens: [],
				},
			]);

			// Grant camera permissions
			await page.context().grantPermissions(['camera'], { origin: page.url() });

			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await switchToQRImportTab(page);

			// Should see camera interface
			await expect(page.getByText('Point your camera at a QR code containing network configuration')).toBeVisible();
			await expect(page.locator('video')).toBeVisible();

			// Simulate a successful QR scan by switching to JSON tab and entering the data
			await page.getByTestId('networks-json-tab').click();
			await page.getByTestId('networks-textarea').fill(qrNetworkData);

			// Import the data
			await page.getByTestId('networks-add-btn').click();

			// Should close modal and show imported network
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });
			await expect(page.getByTestId('network-name@QR Scanned Network')).toBeVisible();
		});
	});

	test.describe('Edge Cases and Error Handling', () => {
		test('Handle very large JSON import', async ({ page }) => {
			const veryLargeArray = Array.from({ length: 20 }, (_, i) => ({
				guid: `bulk-network-${i}`,
				name: `Bulk Network ${i}`,
				chainID: 10000 + i,
				currency: {
					symbol: `BLK${i}`,
					iconURL: `https://example.com/bulk${i}.png`,
				},
				rpcURLs: [`https://rpc${i}.example.com`, `https://backup-rpc${i}.example.com`],
				tokens: [
					{
						guid: `bulk-token-${i}`,
						icon: `https://example.com/token${i}.png`,
						symbol: `TKN${i}`,
						name: `Bulk Token ${i}`,
						contract_address: `0x${i.toString().padStart(40, '0')}`,
					},
				],
			}));

			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(veryLargeArray));
			await clickAddNetworks(page);

			// Should succeed for reasonable number of networks
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 10000 });

			// Verify some networks were imported
			await expect(page.getByTestId('network-name@Bulk Network 0')).toBeVisible();
		});

		test('Cancel replace operation', async ({ page }) => {
			// First add a network
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs.slice(0, 1)));
			await clickAddNetworks(page);
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Try to replace
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs.slice(1, 2)));
			await clickReplaceAllNetworks(page);

			// Cancel the replace dialog
			await page.getByTestId('cancel-replace-btn').click();

			// Original network should still exist
			await closeModal(page, 'wallet-settings-networks-import');
			await expect(page.getByTestId('network-name@Test Network 1')).toBeVisible();
		});

		test('Modal close behavior during operations', async ({ page }) => {
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs));

			// Close modal without performing any action
			await closeModal(page, 'wallet-settings-networks-import');

			// Should return to networks management without changes
			await expect(page.getByTestId('network-name@Test Network 1')).not.toBeVisible();
		});

		test('Import/Export cycle consistency', async ({ page }) => {
			// Import networks
			await goToNetworksManagement(page);
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(validNetworkConfigs));
			await clickAddNetworks(page);
			await expect(page.getByTestId('networks-import-Modal')).not.toBeVisible({ timeout: 5000 });

			// Export networks
			await openNetworksExportModal(page);
			const exportedContent = await getExportedNetworksJSON(page);
			await closeModal(page, 'wallet-settings-networks-export');

			// Replace with one minimal network
			const minimalNetwork = [
				{
					guid: 'temp-network',
					name: 'Temp Network',
					chainID: 999,
					currency: {
						symbol: 'TEMP',
						iconURL: 'https://example.com/temp.png',
					},
					rpcURLs: ['https://temp.example.com'],
					tokens: [],
				},
			];

			await openNetworksImportModal(page);
			await fillNetworksImportData(page, JSON.stringify(minimalNetwork));
			await clickReplaceAllNetworks(page);
			await confirmReplaceNetworksDialog(page);

			// Import the exported content back
			await openNetworksImportModal(page);
			await fillNetworksImportData(page, exportedContent);
			await clickReplaceAllNetworks(page);
			await confirmReplaceNetworksDialog(page);

			// Verify networks are restored
			await expect(page.getByTestId('network-name@Test Network 1')).toBeVisible();
			await expect(page.getByTestId('network-name@Test Network 2')).toBeVisible();
		});
	});
});
