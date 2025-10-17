import { expect, test, chromium } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardWindow, switchModule } from '@/core/tests/e2e/test-utils.js';

const SLEEP_MS = parseInt(process.env.SLEEP || '0');

async function sleep() {
	if (SLEEP_MS > 0) {
		await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
	}
}

(process.env.RUN_HARDWARE_TESTS ? test.describe : test.describe.skip)('Wallet Send Dialog - SW to Trezor', () => {
	let browser;
	let context;
	let page;

	test.beforeAll(async () => {
		if (process.env.BROWSER) {
			// Connect to existing browser via CDP
			browser = await chromium.connectOverCDP(process.env.BROWSER);
			context = browser.contexts()[0] || (await browser.newContext());
			page = context.pages()[0] || (await context.newPage());
		}
	});

	test.afterAll(async () => {
		if (process.env.BROWSER && browser) {
			await browser.close();
		}
	});

	test.beforeEach(async ({ page: testPage }) => {
		// Use CDP page if available, otherwise use test page
		const currentPage = process.env.BROWSER ? page : testPage;

		// Setup console logging (controlled by PLAYWRIGHT_CONSOLE_LOG env var)
		setupConsoleLogging(currentPage);

		await currentPage.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

		// Wait for the page to be ready
		await currentPage.waitForLoadState('networkidle');

		// Close the wizard window if it appears
		await closeWelcomeWizardWindow(currentPage);

		// Switch to wallet module
		await switchModule(currentPage, 'org.libersoft.wallet');
	});

	test('should send from software wallet to Trezor address', async ({ page: testPage }) => {
		// Use CDP page if available, otherwise use test page
		const currentPage = process.env.BROWSER ? page : testPage;

		await test.step('Wait for wallet page to load', async () => {
			// Verify we're on the wallet page by checking for wallet-specific elements
			await expect(currentPage.getByTestId('wallet-network-dropdown')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-address-dropdown')).toBeVisible();
		});

		await test.step('Click network selection dropdown', async () => {
			// Click the network selection dropdown
			await currentPage.getByTestId('wallet-network-dropdown').click();
			await sleep();
		});

		await test.step('Select Polygon - Mainnet network', async () => {
			// Click on the Polygon - Mainnet network
			await expect(currentPage.locator('[data-network-name="Polygon - Mainnet"]')).toBeVisible();
			await currentPage.locator('[data-network-name="Polygon - Mainnet"]').click();
			await sleep();
		});

		await test.step('Click wallet selection dropdown', async () => {
			// Click the wallet/address selection dropdown
			await currentPage.getByTestId('wallet-address-dropdown').click();
			await sleep();
		});

		await test.step('Click My Wallet 1', async () => {
			// Click on the My Wallet 1 software wallet
			await currentPage.locator('[data-wallet-name="My Wallet 1"]').click();
			await sleep();
		});

		await test.step('Select first address from wallet', async () => {
			// Wait for address list to be visible and click the first address (index 0)
			await expect(currentPage.getByTestId('wallet-address-0')).toBeVisible();
			await currentPage.getByTestId('wallet-address-0').click();
			await sleep();
		});

		await test.step('Verify wallet selection is closed and address is selected', async () => {
			// The wallet selection dialog should close after selecting an address
			// Verify we're back on the main wallet page
			await expect(currentPage.getByTestId('wallet-send-btn')).toBeVisible();
		});

		await test.step('Click Send button to navigate to send section', async () => {
			// Click the Send button on the wallet page
			await currentPage.getByTestId('wallet-send-btn').click();
			await sleep();
		});

		await test.step('Verify send page is displayed', async () => {
			// Verify we're now on the send page by checking for send-specific elements
			await expect(currentPage.getByTestId('wallet-send-scan-qr-btn')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-send-address-input')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-send-currency-dropdown')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-send-amount-input')).toBeVisible();
		});

		await test.step('Click on Trezor Model T:1 addr0 in sidebar', async () => {
			// Click on the specific Trezor address in the sidebar
			await expect(currentPage.locator('[data-address-name="Trezor Model T:1 addr0"]')).toBeVisible();
			await currentPage.locator('[data-address-name="Trezor Model T:1 addr0"]').click();
			await sleep();
		});

		await test.step('Verify address input is populated', async () => {
			// Verify that the address input field is populated after clicking the sidebar address
			await expect(currentPage.getByTestId('wallet-send-address-input')).not.toHaveValue('');
		});

		await test.step('Select POL currency', async () => {
			// Click the currency dropdown
			await currentPage.getByTestId('wallet-send-currency-dropdown').click();
			await sleep();

			// Type "POL" to filter the currency options
			await currentPage.getByTestId('wallet-send-currency-dropdown').locator('input').fill('POL');

			// Wait for the dropdown options to appear and click the first one
			await currentPage.getByTestId('wallet-send-currency-dropdown').locator('.options .option').first().click();
			await sleep();
		});

		await test.step('Enter amount', async () => {
			// Fill in the amount field
			await currentPage.getByTestId('wallet-send-amount-input').fill('0.0002');
			await sleep();
		});

		await test.step('Wait for transaction fee to be calculated', async () => {
			// Wait for the transaction fee field to be auto-populated
			// The fee input should have a non-empty value (not just placeholder)
			await expect(currentPage.getByTestId('wallet-send-fee-input')).not.toHaveValue('', { timeout: 10000 });
		});

		await test.step('Click Send button', async () => {
			// Click the send submit button
			await currentPage.getByTestId('wallet-send-submit-btn').click();
			await sleep();
		});

		await test.step('Click Yes in confirmation dialog', async () => {
			// Wait for the confirmation dialog to appear and click Yes
			await expect(currentPage.getByTestId('wallet-send-confirm-yes-btn')).toBeVisible();
			await currentPage.getByTestId('wallet-send-confirm-yes-btn').click();
			await sleep();
		});

		await test.step('Verify transaction completed', async () => {
			// For software wallet transactions, no additional popups should appear
			// The confirmation dialog should close and transaction should be complete
			await expect(currentPage.getByTestId('wallet-send-confirm-yes-btn')).not.toBeVisible({ timeout: 25000 });
		});
	});
});
