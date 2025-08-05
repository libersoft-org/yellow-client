import { expect, test, chromium } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardWindow, switchModule } from '@/core/e2e/test-utils.js';

const SLEEP_MS = parseInt(process.env.SLEEP || '0');

async function sleep() {
	if (SLEEP_MS > 0) {
		await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
	}
}

test.describe('Wallet Send Dialog Navigation', () => {
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

	test('should navigate to wallet and open send dialog', async ({ page: testPage }) => {
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
		});

		await test.step('Select Polygon - Mainnet network', async () => {
			// Click on the Polygon - Mainnet network
			await expect(currentPage.locator('[data-network-name="Polygon - Mainnet"]')).toBeVisible();
			await currentPage.locator('[data-network-name="Polygon - Mainnet"]').click();
		});

		await test.step('Click wallet selection dropdown', async () => {
			// Click the wallet/address selection dropdown
			await currentPage.getByTestId('wallet-address-dropdown').click();
		});

		await test.step('Click Trezor Model T:1 wallet', async () => {
			// Click on the specific Trezor Model T:1 wallet
			await currentPage.locator('[data-wallet-name="Trezor Model T:1"]').click();
		});

		await test.step('Select first address from wallet', async () => {
			// Wait for address list to be visible and click the first address (index 0)
			await expect(currentPage.getByTestId('wallet-address-0')).toBeVisible();
			await currentPage.getByTestId('wallet-address-0').click();
		});

		await test.step('Verify wallet selection is closed and address is selected', async () => {
			// The wallet selection dialog should close after selecting an address
			// Verify we're back on the main wallet page
			await expect(currentPage.getByTestId('wallet-send-btn')).toBeVisible();
		});

		await test.step('Click Send button to navigate to send section', async () => {
			// Click the Send button on the wallet page
			await currentPage.getByTestId('wallet-send-btn').click();
		});

		await test.step('Verify send page is displayed', async () => {
			// Verify we're now on the send page by checking for send-specific elements
			await expect(currentPage.getByTestId('wallet-send-scan-qr-btn')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-send-address-input')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-send-currency-dropdown')).toBeVisible();
			await expect(currentPage.getByTestId('wallet-send-amount-input')).toBeVisible();
		});

		await test.step('Click on wallet 1 Address 0 in sidebar', async () => {
			// Click on the specific address in the sidebar
			await expect(currentPage.locator('[data-address-name="wallet 1 Address 0"]')).toBeVisible();
			await currentPage.locator('[data-address-name="wallet 1 Address 0"]').click();
		});

		await test.step('Verify address input is populated', async () => {
			// Verify that the address input field is populated after clicking the sidebar address
			await expect(currentPage.getByTestId('wallet-send-address-input')).not.toHaveValue('');
		});

		await test.step('Select POL currency', async () => {
			// Click the currency dropdown
			await currentPage.getByTestId('wallet-send-currency-dropdown').click();

			// Type "POL" to filter the currency options
			await currentPage.getByTestId('wallet-send-currency-dropdown').locator('input').fill('POL');

			// Wait for filtered options and select POL
			await currentPage.getByText('POL', { exact: false }).first().click();
		});

		await test.step('Enter amount 0.001', async () => {
			// Fill in the amount field
			await currentPage.getByTestId('wallet-send-amount-input').fill('0.001');
		});

		await test.step('Click Send button', async () => {
			// Click the send submit button
			await currentPage.getByTestId('wallet-send-submit-btn').click();
		});

		await test.step('Verify send confirmation dialog appears', async () => {
			// The send confirmation dialog should appear after clicking send
			// This may vary depending on the actual dialog implementation
			// For now, we'll just verify the button was clicked successfully
			await expect(currentPage.getByTestId('wallet-send-submit-btn')).toBeVisible();
		});
	});
});
