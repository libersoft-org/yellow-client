import { expect, type Page } from '@playwright/test';
import { test } from '@playwright/test';

/**
 * Helper function to switch to a module only if it's not already selected
 * @param page - The Playwright page object
 * @param moduleId - The module ID to switch to
 */
export async function switchModule(page: Page, moduleId: string): Promise<void> {
	return await test.step(`Switch to module: ${moduleId}`, async () => {
		const moduleSelector = page.getByTestId(`ModuleBarItem-${moduleId}`);
		const selectedElement = moduleSelector.locator('div.selected');

		// Wait for module selector to be ready
		await moduleSelector.waitFor({ state: 'visible' });

		// Check if module is already selected
		let isSelected = (await selectedElement.count()) > 0;

		// Only click if not already selected
		if (!isSelected) {
			await moduleSelector.click();
			// Wait for module to load
			await page.waitForTimeout(1000);
		}
	});
}

/**
 * Helper function to close any modal
 * @param page - The Playwright page object
 * @param testId - Optional specific modal testId to close
 */
export async function closeModal(page: Page, testId?: string): Promise<void> {
	return await test.step('Close modal', async () => {
		if (testId) {
			await page.getByTestId(`${testId}-Modal-close`).click({ force: true });
		} else {
			await page.getByTestId('-Modal-close').first().click({ force: true });
		}
	});
}

/**
 * Helper function to wait for and check error message
 * @param page - The Playwright page object
 * @param expectedError - The expected error message (partial match)
 */
export async function expectErrorMessage(page: Page, expectedError: string): Promise<void> {
	return await test.step(`Expect error message: ${expectedError}`, async () => {
		await expect(page.locator('.alert').filter({ hasText: expectedError })).toBeVisible({ timeout: 5000 });
	});
}
