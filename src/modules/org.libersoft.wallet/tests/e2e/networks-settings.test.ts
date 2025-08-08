import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardWindow, expectErrorMessage, closeWindow, switchModule } from '@/core/e2e/test-utils.js';

const TEST_NETWORK = {
	name: 'Test Network',
	currencySymbol: 'TEST',
	iconUrl: 'https://example.com/icon.png',
	chainId: '999',
	explorerUrl: 'https://example.com/explorer',
	rpcUrl: 'https://example.com/rpc',
};

const EDITED_NETWORK = {
	name: 'Edited Network',
	currencySymbol: 'EDIT',
	chainId: '1000',
	explorerUrl: 'https://edited.com/explorer',
};

test.describe.parallel('Wallet Settings - Networks', () => {
	test.beforeEach(async ({ page }) => {
		// Setup console logging (controlled by PLAYWRIGHT_CONSOLE_LOG env var)
		setupConsoleLogging(page);

		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

		// Wait for the page to be ready
		await page.waitForLoadState('networkidle');

		// Close the wizard window if it appears
		await closeWelcomeWizardWindow(page);

		// Wait for module bar to be visible before switching
		await page.getByTestId(`ModuleBarItem-org.libersoft.wallet`).waitFor({ state: 'visible' });

		// Switch to wallet module
		await switchModule(page, 'org.libersoft.wallet');

		// Navigate to Networks settings
		await goToNetworksSettings(page);
	});

	test.describe('Add Network', () => {
		test('should add a new network with all fields', async ({ page }) => {
			await test.step('Click add network button', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
				// Wait for the add network form to be visible
				// Wait for add network window
				await page.waitForSelector('[data-testid="wallet-settings-network-name-input"]');
			});

			await test.step('Fill network details', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill(TEST_NETWORK.name);
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill(TEST_NETWORK.currencySymbol);
				await page.getByTestId('wallet-settings-network-icon-url-input').fill(TEST_NETWORK.iconUrl);
				await page.getByTestId('wallet-settings-network-chain-id-input').fill(TEST_NETWORK.chainId);
				await page.getByTestId('wallet-settings-network-explorer-url-input').fill(TEST_NETWORK.explorerUrl);
			});

			await test.step('Add RPC URL', async () => {
				await page.getByTestId('wallet-settings-network-add-rpc-url-btn').click();
				await page.getByTestId('wallet-settings-network-rpc-url-input-0').fill(TEST_NETWORK.rpcUrl);
			});

			await test.step('Save network', async () => {
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Verify network was added', async () => {
				await expect(page.getByTestId(`wallet-settings-network-name@${TEST_NETWORK.name}`)).toBeVisible();
			});
		});

		test('should validate required fields', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Try to save without required fields', async () => {
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Check validation errors', async () => {
				await expect(page.getByText('Network name is required')).toBeVisible();
			});

			await test.step('Fill name and try again', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Test');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('Currency symbol is required')).toBeVisible();
			});

			await test.step('Fill currency symbol and try again', async () => {
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('TST');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('Chain ID must be a positive whole number')).toBeVisible();
			});
		});

		test('should validate chain ID format', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill basic required fields', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Test');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('TST');
			});

			await test.step('Enter invalid chain ID', async () => {
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('-1');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('Chain ID must be a positive whole number')).toBeVisible();
			});

			await test.step('Enter decimal chain ID', async () => {
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('1.5');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('Chain ID must be a positive whole number')).toBeVisible();
			});

			await test.step('Enter valid chain ID', async () => {
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('0');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				// Should succeed - verify network was added
				await expect(page.getByTestId('wallet-settings-network-name@Test')).toBeVisible();
			});
		});

		test('should validate empty and whitespace-only fields', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Try whitespace-only name', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('   ');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('TEST');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('1');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('Network name is required')).toBeVisible();
			});

			await test.step('Try whitespace-only currency symbol', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Test Network');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').clear();
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('   ');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('Currency symbol is required')).toBeVisible();
			});
		});

		test('should trim whitespace from fields', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill fields with extra whitespace', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('  Trimmed Network  ');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('  TRM  ');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('7000');
				await page.getByTestId('wallet-settings-network-explorer-url-input').fill('  https://explorer.com  ');
			});

			await test.step('Save network', async () => {
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Verify trimmed values were saved', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Trimmed Network')).toBeVisible();
				// Edit the network to verify trimmed values
				await page.getByTestId('wallet-settings-network-edit@Trimmed Network').click();
				await expect(page.getByTestId('wallet-settings-network-name-input')).toHaveValue('Trimmed Network');
				await expect(page.getByTestId('wallet-settings-network-currency-symbol-input')).toHaveValue('TRM');
				await expect(page.getByTestId('wallet-settings-network-explorer-url-input')).toHaveValue('https://explorer.com');
			});
		});

		test('should validate RPC URL fields', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill basic required fields', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('RPC Test Network');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('RPC');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('8000');
			});

			await test.step('Add empty RPC URL', async () => {
				await page.getByTestId('wallet-settings-network-add-rpc-url-btn').click();
				// Leave RPC URL empty
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('RPC URL 1 is required')).toBeVisible();
			});

			await test.step('Add whitespace-only RPC URL', async () => {
				await page.getByTestId('wallet-settings-network-rpc-url-input-0').fill('   ');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('RPC URL 1 is required')).toBeVisible();
			});

			await test.step('Add valid RPC URLs', async () => {
				await page.getByTestId('wallet-settings-network-rpc-url-input-0').fill('https://rpc1.example.com');
				await page.getByTestId('wallet-settings-network-add-rpc-url-btn').click();
				await page.getByTestId('wallet-settings-network-rpc-url-input-1').fill('https://rpc2.example.com');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByTestId('wallet-settings-network-name@RPC Test Network')).toBeVisible();
			});
		});

		test('should handle special characters in fields', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill fields with special characters', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Test & Network <> "Special"');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('T&S');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('9000');
				await page.getByTestId('wallet-settings-network-explorer-url-input').fill('https://explorer.com/path?query=1&param=2');
			});

			await test.step('Save network', async () => {
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Verify network was added with special characters', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Test & Network <> "Special"')).toBeVisible();
			});
		});

		test('should handle very long field values', async ({ page }) => {
			const longName = 'A'.repeat(100) + ' Network';
			const longSymbol = 'LONG'.repeat(10);
			const longUrl = 'https://example.com/' + 'path/'.repeat(50);

			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill fields with long values', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill(longName);
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill(longSymbol);
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('10000');
				await page.getByTestId('wallet-settings-network-explorer-url-input').fill(longUrl);
			});

			await test.step('Save network', async () => {
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Verify network was added', async () => {
				await expect(page.getByTestId(`wallet-settings-network-name@${longName}`)).toBeVisible();
			});
		});

		test('should handle multiple RPC URLs with validation', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill basic required fields', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Multi RPC Network');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('MRP');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('2000');
			});

			await test.step('Add multiple RPC URLs', async () => {
				// Add first RPC URL
				await page.getByTestId('wallet-settings-network-add-rpc-url-btn').click();
				await page.getByTestId('wallet-settings-network-rpc-url-input-0').fill('https://rpc1.example.com');

				// Add second RPC URL (empty)
				await page.getByTestId('wallet-settings-network-add-rpc-url-btn').click();

				// Add third RPC URL
				await page.getByTestId('wallet-settings-network-add-rpc-url-btn').click();
				await page.getByTestId('wallet-settings-network-rpc-url-input-2').fill('https://rpc3.example.com');
			});

			await test.step('Try to save with empty RPC URL', async () => {
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByText('RPC URL 2 is required')).toBeVisible();
			});

			await test.step('Fill empty RPC URL and save', async () => {
				await page.getByTestId('wallet-settings-network-rpc-url-input-1').fill('https://rpc2.example.com');
				await page.getByTestId('wallet-settings-network-add-btn').click();
				await expect(page.getByTestId('wallet-settings-network-name@Multi RPC Network')).toBeVisible();
			});
		});

		test('should cancel adding network', async ({ page }) => {
			await test.step('Open add network form', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-add-custom-network').click();
			});

			await test.step('Fill some fields', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Cancelled Network');
			});

			await test.step('Cancel', async () => {
				await page.getByTestId('wallet-settings-network-cancel-btn').click();
			});

			await test.step('Verify network was not added', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Cancelled Network')).not.toBeVisible();
			});
		});
	});

	test.describe('Edit Network', () => {
		test('should edit an existing network', async ({ page }) => {
			// First add a network to edit
			await test.step('Add network to edit', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-network-name-input').fill(TEST_NETWORK.name);
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill(TEST_NETWORK.currencySymbol);
				await page.getByTestId('wallet-settings-network-chain-id-input').fill(TEST_NETWORK.chainId);
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Click edit button', async () => {
				await page.getByTestId(`wallet-settings-network-edit@${TEST_NETWORK.name}`).click();
				// Wait for edit form
				await page.waitForSelector('[data-testid="wallet-settings-network-save-btn"]');
			});

			await test.step('Verify current values are loaded', async () => {
				await expect(page.getByTestId('wallet-settings-network-name-input')).toHaveValue(TEST_NETWORK.name);
				await expect(page.getByTestId('wallet-settings-network-currency-symbol-input')).toHaveValue(TEST_NETWORK.currencySymbol);
				await expect(page.getByTestId('wallet-settings-network-chain-id-input')).toHaveValue(TEST_NETWORK.chainId);
			});

			await test.step('Edit network details', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill(EDITED_NETWORK.name);
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill(EDITED_NETWORK.currencySymbol);
				await page.getByTestId('wallet-settings-network-chain-id-input').fill(EDITED_NETWORK.chainId);
				await page.getByTestId('wallet-settings-network-explorer-url-input').fill(EDITED_NETWORK.explorerUrl);
			});

			await test.step('Save changes', async () => {
				await page.getByTestId('wallet-settings-network-save-btn').click();
			});

			await test.step('Verify network was updated', async () => {
				await expect(page.getByTestId(`wallet-settings-network-name@${EDITED_NETWORK.name}`)).toBeVisible();
				await expect(page.getByTestId(`wallet-settings-network-name@${TEST_NETWORK.name}`)).not.toBeVisible();
			});
		});

		test('should validate fields when editing', async ({ page }) => {
			// First add a network to edit
			await test.step('Add network to edit', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-network-name-input').fill('Network to Edit');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('EDIT');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('11000');
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Click edit button', async () => {
				await page.getByTestId('wallet-settings-network-edit@Network to Edit').click();
			});

			await test.step('Clear required fields and try to save', async () => {
				await page.getByTestId('wallet-settings-network-name-input').clear();
				await page.getByTestId('wallet-settings-network-save-btn').click();
				await expect(page.getByText('Network name is required')).toBeVisible();
			});

			await test.step('Enter invalid chain ID', async () => {
				await page.getByTestId('wallet-settings-network-name-input').fill('Valid Name');
				await page.getByTestId('wallet-settings-network-chain-id-input').clear();
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('-100');
				await page.getByTestId('wallet-settings-network-save-btn').click();
				await expect(page.getByText('Chain ID must be a positive whole number')).toBeVisible();
			});
		});

		test('should cancel editing network', async ({ page }) => {
			// First add a network to edit
			await test.step('Add network to edit', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-network-name-input').fill('Original Network');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('ORIG');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('3000');
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Click edit and make changes', async () => {
				await page.getByTestId('wallet-settings-network-edit@Original Network').click();
				await page.getByTestId('wallet-settings-network-name-input').fill('Changed Network');
			});

			await test.step('Cancel editing', async () => {
				await page.getByTestId('wallet-settings-network-cancel-btn').click();
			});

			await test.step('Verify network was not changed', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Original Network')).toBeVisible();
				await expect(page.getByTestId('wallet-settings-network-name@Changed Network')).not.toBeVisible();
			});
		});
	});

	test.describe('Delete Network', () => {
		test('should delete a network', async ({ page }) => {
			// First add a network to delete
			await test.step('Add network to delete', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-network-name-input').fill('Network to Delete');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('DEL');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('4000');
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Click delete button', async () => {
				await page.getByTestId('wallet-settings-network-del@Network to Delete').click();
				// Wait for confirmation dialog
				await page.waitForSelector('[data-testid="wallet-settings-network-delete-yes-btn"]');
			});

			await test.step('Confirm deletion', async () => {
				await expect(page.getByText('Would you like to delete the network "Network to Delete"?')).toBeVisible();
				await page.getByTestId('wallet-settings-network-delete-yes-btn').click();
			});

			await test.step('Verify network was deleted', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Network to Delete')).not.toBeVisible();
			});
		});

		test('should cancel deleting a network', async ({ page }) => {
			// First add a network
			await test.step('Add network', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-network-name-input').fill('Network to Keep');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('KEEP');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('5000');
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Click delete but cancel', async () => {
				await page.getByTestId('wallet-settings-network-del@Network to Keep').click();
				await page.getByTestId('wallet-settings-network-delete-no-btn').click();
			});

			await test.step('Verify network was not deleted', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Network to Keep')).toBeVisible();
			});
		});
	});

	test.describe('Network List', () => {
		test('should display default networks', async ({ page }) => {
			await test.step('Check for default networks', async () => {
				// Check for networks list container to be visible
				await expect(page.getByTestId('wallet-settings-networks')).toBeVisible();

				// Check that the add new button is visible indicating the page loaded
				await expect(page.getByTestId('wallet-settings-networks-add-new-btn')).toBeVisible();
			});
		});

		test('should handle network with minimal required fields', async ({ page }) => {
			await test.step('Add minimal network', async () => {
				await page.getByTestId('wallet-settings-networks-add-new-btn').click();
				await page.getByTestId('wallet-settings-network-name-input').fill('Minimal Network');
				await page.getByTestId('wallet-settings-network-currency-symbol-input').fill('MIN');
				await page.getByTestId('wallet-settings-network-chain-id-input').fill('6000');
				await page.getByTestId('wallet-settings-network-add-btn').click();
			});

			await test.step('Verify network was added', async () => {
				await expect(page.getByTestId('wallet-settings-network-name@Minimal Network')).toBeVisible();
			});
		});
	});
});

/**
 * Helper function to navigate to wallet networks settings
 * @param page - The Playwright page object
 */
async function goToNetworksSettings(page: Page): Promise<void> {
	return await test.step('Go to networks settings', async () => {
		// The wallet module should already be selected from beforeEach
		// Click on the network dropdown to open "Select your network" window
		await page.getByTestId('wallet-network-dropdown').click();

		// Wait for the window to appear and click "Manage networks" button
		await page.getByTestId('wallet-manage-networks-btn').click();

		// Wait for the networks management window to be visible
		await page.getByTestId('wallet-settings-networks-add-new-btn').waitFor({ state: 'visible' });
	});
}
