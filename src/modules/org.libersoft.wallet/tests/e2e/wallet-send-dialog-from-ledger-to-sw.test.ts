import { expect, test, chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardWindow, switchModule } from '@/core/tests/e2e/test-utils.js';

const SLEEP_MS = parseInt(process.env.SLEEP || '0');

async function sleep() {
	if (SLEEP_MS > 0) {
		await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
	}
}

// Common helper functions for Ledger wallet testing
async function navigateToWallet(page: Page) {
	await test.step('Wait for wallet page to load', async () => {
		await expect(page.getByTestId('wallet-network-dropdown')).toBeVisible();
		await expect(page.getByTestId('wallet-address-dropdown')).toBeVisible();
	});
}

async function selectPolygonNetwork(page: Page) {
	await test.step('Select Polygon - Mainnet network', async () => {
		await page.getByTestId('wallet-network-dropdown').click();
		await sleep();
		await expect(page.locator('[data-network-name="Polygon - Mainnet"]')).toBeVisible();
		await page.locator('[data-network-name="Polygon - Mainnet"]').click();
		await sleep();
	});
}

async function selectLedgerWallet(page: Page, walletName: string = 'Ledger Flex', addressIndex: number = 0) {
	await test.step(`Select ${walletName} wallet and address ${addressIndex}`, async () => {
		// Open wallet dropdown
		await page.getByTestId('wallet-address-dropdown').click();
		await sleep();

		// Select Ledger wallet
		await page.locator(`[data-wallet-name="${walletName}"]`).click();
		await sleep();

		// Select address
		await expect(page.getByTestId(`wallet-address-${addressIndex}`)).toBeVisible();
		await page.getByTestId(`wallet-address-${addressIndex}`).click();
		await sleep();

		// Verify selection
		await expect(page.getByTestId('wallet-send-btn')).toBeVisible();
	});
}

async function navigateToSendPage(page: Page) {
	await test.step('Navigate to send page', async () => {
		await page.getByTestId('wallet-send-btn').click();
		await sleep();

		// Verify send page elements
		await expect(page.getByTestId('wallet-send-scan-qr-btn')).toBeVisible();
		await expect(page.getByTestId('wallet-send-address-input')).toBeVisible();
		await expect(page.getByTestId('wallet-send-currency-dropdown')).toBeVisible();
		await expect(page.getByTestId('wallet-send-amount-input')).toBeVisible();
	});
}

async function fillSendForm(page: Page, recipientAddress: string, currency: string, amount: string) {
	await test.step(`Fill send form: ${amount} ${currency} to ${recipientAddress}`, async () => {
		// Enter recipient address
		await page.getByTestId('wallet-send-address-input').fill(recipientAddress);
		await sleep();

		// Select currency
		await page.getByTestId('wallet-send-currency-dropdown').click();
		await sleep();
		await page.getByTestId('wallet-send-currency-dropdown').locator('input').fill(currency);
		await page.getByTestId('wallet-send-currency-dropdown').locator('.options .option').first().click();
		await sleep();

		// Enter amount
		await page.getByTestId('wallet-send-amount-input').fill(amount);
		await sleep();

		// Wait for fee calculation
		await expect(page.getByTestId('wallet-send-fee-input')).not.toHaveValue('', { timeout: 10000 });
	});
}

async function submitAndConfirmTransaction(page: Page) {
	await test.step('Submit and confirm transaction', async () => {
		// Submit transaction
		await page.getByTestId('wallet-send-submit-btn').click();
		await sleep();

		// Confirm in dialog
		await expect(page.getByTestId('wallet-send-confirm-yes-btn')).toBeVisible({ timeout: 35000 });
		await page.getByTestId('wallet-send-confirm-yes-btn').click();
		await sleep();
	});
}

async function handleLedgerSigning(page: Page) {
	await test.step('Handle Ledger signing flow', async () => {
		// Wait for Ledger connect button
		await expect(page.getByTestId('connect-ledger-btn')).toBeVisible({ timeout: 10000 });

		// Click to connect (triggers WebUSB/WebHID dialog)
		await page.getByTestId('connect-ledger-btn').click();
		await sleep();

		// Wait for connection confirmation
		await expect(page.getByText('Ledger wallet connected')).toBeVisible({ timeout: 30000 });

		// Close the connection dialog
		await page.getByTestId('close-ledger-window-btn').click();
		await sleep();

		// Wait for transaction to be signed and sent
		await expect(page.getByTestId('wallet-send-confirm-yes-btn')).not.toBeVisible({ timeout: 60000 });
	});
}

(process.env.RUN_HARDWARE_TESTS ? test.describe : test.describe.skip)('Ledger Wallet Send Dialog Navigation', () => {
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
		//await closeWelcomeWizardWindow(currentPage);

		// Switch to wallet module
		await switchModule(currentPage, 'org.libersoft.wallet');
	});

	test('should send POL from Ledger to software wallet', async ({ page: testPage }) => {
		const currentPage = process.env.BROWSER ? page : testPage;

		await navigateToWallet(currentPage);
		await selectPolygonNetwork(currentPage);
		await selectLedgerWallet(currentPage, 'Ledger Flex', 0);
		await navigateToSendPage(currentPage);

		// Send 0.001 POL to specified address
		await fillSendForm(currentPage, '0xC7a16403A48421Da27eA36e149d34Ba390a3C3a9', 'POL', '0.001');

		await submitAndConfirmTransaction(currentPage);
		await handleLedgerSigning(currentPage);

		await test.step('Verify transaction completed', async () => {
			// Verify we're back on the wallet page
			await expect(currentPage.getByTestId('wallet-send-btn')).toBeVisible();
		});
	});

	test('should send MYT token from Ledger to software wallet', async ({ page: testPage }) => {
		// NOTE: This test requires "Contract data" to be enabled on the Ledger device
		// To enable: Ethereum app > Settings > Contract data > Enabled
		const currentPage = process.env.BROWSER ? page : testPage;

		await navigateToWallet(currentPage);
		await selectPolygonNetwork(currentPage);
		await selectLedgerWallet(currentPage, 'Ledger Flex', 0);
		await navigateToSendPage(currentPage);

		// Send 10 MYT tokens to specified address
		await fillSendForm(currentPage, '0xC7a16403A48421Da27eA36e149d34Ba390a3C3a9', 'MYT', '10');

		await submitAndConfirmTransaction(currentPage);
		await handleLedgerSigning(currentPage);

		await test.step('Verify transaction completed', async () => {
			// Verify we're back on the wallet page
			await expect(currentPage.getByTestId('wallet-send-btn')).toBeVisible();
		});
	});
});
