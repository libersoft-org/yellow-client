import { test, expect } from '@playwright/test';
import { setupConsoleLogging } from '@/core/e2e/test-utils.js';

const accountsConfig = [
	{
		id: '0',
		enabled: true,
		credentials: {
			address: 'test@example.com',
			server: 'ws://localhost:8085/',
			password: 'password',
		},
		settings: {
			title: 'Test Account',
			last_module_id: 'org.libersoft.messages',
		},
	},
];

const activeAccountId = '0';

test.describe.parallel('Theme Management', () => {
	test.beforeEach(async ({ page }) => {
		// Setup console logging (controlled by PLAYWRIGHT_CONSOLE_LOG env var)
		setupConsoleLogging(page);

		// Set up local storage with account configuration
		await page.goto('http://localhost:3000');
		await page.evaluate(
			({ accountsConfig, activeAccountId }) => {
				localStorage.setItem('accounts_config', JSON.stringify(accountsConfig));
				localStorage.setItem('active_account_id', JSON.stringify(activeAccountId));
				// Disable follow browser theme by default for testing
				localStorage.setItem('followBrowserTheme', 'false');
			},
			{ accountsConfig, activeAccountId }
		);
		await page.reload();
		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');
	});

	test('should display theme selector in settings', async ({ page }) => {
		// Open menu
		await page.getByTestId('menu-button').click();
		await page.waitForTimeout(500); // Wait for menu animation

		// Click Settings in menu
		await page.getByTestId('menu-item-settings').click();
		await page.waitForTimeout(500); // Wait for window to open

		// Navigate to appearance settings
		await page.getByTestId('settings-appearance').click();
		await page.waitForTimeout(300); // Wait for section to load

		// Check if theme selector exists
		const themeSelector = page.getByTestId('theme switch');
		await expect(themeSelector).toBeVisible();
	});

	test('should switch between light and dark themes', async ({ page }) => {
		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('menu-item-settings').click();
		await page.waitForTimeout(500);
		await page.getByTestId('settings-appearance').click();
		await page.waitForTimeout(300);

		// Get theme selector
		const themeSelector = page.getByTestId('theme switch');

		// Select Light theme
		await themeSelector.selectOption('0');

		// Verify Light theme is applied
		const lightBgColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--default-background'));
		expect(lightBgColor.trim()).toBe('#fff');

		// Select Dark theme
		await themeSelector.selectOption('1');

		// Verify Dark theme is applied
		const darkBgColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--default-background'));
		expect(darkBgColor.trim()).toBe('#000');
	});

	test('should persist theme selection across page reloads', async ({ page }) => {
		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('menu-item-settings').click();
		await page.waitForTimeout(500);
		await page.getByTestId('settings-appearance').click();
		await page.waitForTimeout(300);

		// Select Dark theme
		const themeSelector = page.getByTestId('theme switch');
		await themeSelector.selectOption('1');

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000); // Wait for theme to be applied

		// Verify Dark theme is still applied
		const bgColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--default-background'));
		expect(bgColor.trim()).toBe('#000');

		// Open settings again to verify selection
		await page.getByTestId('menu-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('menu-item-settings').click();
		await page.waitForTimeout(500);
		await page.getByTestId('settings-appearance').click();
		await page.waitForTimeout(300);

		// Check selected value
		const selectedValue = await themeSelector.inputValue();
		expect(selectedValue).toBe('1');
	});

	test('should create new custom theme by cloning current theme', async ({ page }) => {
		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.getByTestId('menu-item-settings').click();
		await page.getByTestId('settings-appearance').click();

		// Ensure follow browser theme is disabled
		const followBrowserSwitch = page.getByTestId('follow-browser-theme-switch');
		const isChecked = await followBrowserSwitch.isChecked();
		if (isChecked) {
			await followBrowserSwitch.click();
			await page.waitForTimeout(300);
		}

		// First select Dark theme
		const themeSelector = page.getByTestId('theme switch');
		await themeSelector.selectOption('1');

		// Verify Dark theme is selected
		const selectedValue = await themeSelector.inputValue();
		expect(selectedValue).toBe('1');

		// Wait for the actual theme to be applied by checking CSS variables
		await page.waitForFunction(
			() => {
				const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--default-background');
				return bgColor.trim() === '#000'; // Dark theme has black background
			},
			{},
			{}
		);

		// Click add theme button
		await page.getByTestId('theme-add-button').click();

		// Wait for navigation to theme editor and for the theme to load
		await expect(page.getByTestId('theme-name-input')).toBeVisible();
		const nameInput = page.getByTestId('theme-name-input');
		const initialName = await nameInput.inputValue();
		expect(initialName).toContain('Copy'); // Should be a copy of some theme

		// Edit theme name
		await nameInput.clear();
		await nameInput.fill('My Custom Theme');

		// Verify it has theme properties that can be edited
		const bgColorInput = page.getByTestId('theme-color---default-background');
		const bgColorValue = await bgColorInput.inputValue();
		expect(bgColorValue).toMatch(/^#[0-9a-fA-F]{6}$/); // Should be a valid hex color

		// Navigate back to appearance settings
		await page.getByTestId('breadcrumb-appearance').click();

		// Verify new theme appears in selector
		const options = await themeSelector.locator('option').allTextContents();
		expect(options).toContain('My Custom Theme');
	});

	test('should delete custom theme', async ({ page }) => {
		// First create a custom theme
		await page.goto('http://localhost:3000');
		await page.evaluate(() => {
			const customTheme = {
				name: 'Theme to Delete',
				properties: {
					'--primary-foreground': '#222',
					'--primary-softer-background': '#ffe',
					'--primary-soft-background': '#fec',
					'--primary-background': '#fc1',
					'--primary-hard-background': '#fa0',
					'--primary-harder-background': '#d80',
					'--secondary-foreground': '#fff',
					'--secondary-softer-background': '#555',
					'--secondary-soft-background': '#444',
					'--secondary-background': '#222',
					'--secondary-hard-background': '#111',
					'--secondary-harder-background': '#000',
					'--default-foreground': '#000',
					'--default-background': '#fff',
					'--disabled-background': '#ddd',
					'--disabled-foreground': '#888',
					'--background-image': 'light.webp',
				},
			};
			const currentThemes = JSON.parse(localStorage.getItem('user_themes') || '[]');
			currentThemes.push(customTheme);
			localStorage.setItem('user_themes', JSON.stringify(currentThemes));
			localStorage.setItem('selected_theme_index', '2'); // Select the custom theme
		});

		await page.reload();

		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.getByTestId('menu-item-settings').click();
		await page.getByTestId('settings-appearance').click();

		// Verify delete button is visible for custom theme
		await expect(page.getByTestId('theme-delete-button')).toBeVisible();

		// Click delete button
		await page.getByTestId('theme-delete-button').click();

		// Verify theme is removed from selector
		const themeSelector = page.getByTestId('theme switch');
		const options = await themeSelector.locator('option').allTextContents();
		expect(options).not.toContain('Theme to Delete');
	});

	test('should not show edit/delete buttons for built-in themes', async ({ page }) => {
		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.getByTestId('menu-item-settings').click();
		await page.getByTestId('settings-appearance').click();

		// Select Light theme (built-in)
		const themeSelector = page.getByTestId('theme switch');
		await themeSelector.selectOption('0');

		// Verify edit and delete buttons are not visible
		await expect(page.getByTestId('theme-edit-button')).not.toBeVisible();
		await expect(page.getByTestId('theme-delete-button')).not.toBeVisible();

		// Select Dark theme (built-in)
		await themeSelector.selectOption('1');

		// Verify edit and delete buttons are still not visible
		await expect(page.getByTestId('theme-edit-button')).not.toBeVisible();
		await expect(page.getByTestId('theme-delete-button')).not.toBeVisible();
	});

	test('should use text input for background-image property', async ({ page }) => {
		// Create a custom theme first via localStorage
		await page.evaluate(() => {
			const customTheme = {
				name: 'Custom Test Theme',
				properties: {
					'--primary-foreground': '#222',
					'--primary-softer-background': '#ffe',
					'--primary-soft-background': '#fec',
					'--primary-background': '#fc1',
					'--primary-hard-background': '#fa0',
					'--primary-harder-background': '#d80',
					'--secondary-foreground': '#fff',
					'--secondary-softer-background': '#555',
					'--secondary-soft-background': '#444',
					'--secondary-background': '#222',
					'--secondary-hard-background': '#111',
					'--secondary-harder-background': '#000',
					'--default-foreground': '#000',
					'--default-background': '#fff',
					'--disabled-background': '#ddd',
					'--disabled-foreground': '#888',
					'--background-image': 'test-bg.webp',
				},
			};
			const currentThemes = JSON.parse(localStorage.getItem('user_themes') || '[]');
			currentThemes.push(customTheme);
			localStorage.setItem('user_themes', JSON.stringify(currentThemes));
			localStorage.setItem('selected_theme_index', '2'); // Select the custom theme (0=Light, 1=Dark, 2=Custom)
			localStorage.setItem('followBrowserTheme', 'false'); // Ensure follow browser theme is disabled
		});

		await page.reload();
		await page.waitForLoadState('networkidle');

		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('menu-item-settings').click();
		await page.waitForTimeout(500);
		await page.getByTestId('settings-appearance').click();
		await page.waitForTimeout(300);

		// Verify the custom theme is selected
		const themeSelector = page.getByTestId('theme switch');
		const selectedValue = await themeSelector.inputValue();
		expect(selectedValue).toBe('2');

		// Verify edit button is visible for custom theme
		await expect(page.getByTestId('theme-edit-button')).toBeVisible();

		// Click edit button to edit the custom theme
		await page.getByTestId('theme-edit-button').click();
		await page.waitForTimeout(300);

		// Should be in theme editor now
		await expect(page.getByTestId('theme-name-input')).toBeVisible();

		// Verify background-image uses text input (not color input)
		const bgImageInput = page.getByTestId('theme-text---background-image');
		await expect(bgImageInput).toBeVisible();
		await expect(bgImageInput).toHaveAttribute('type', 'text');
		await expect(bgImageInput).not.toBeDisabled();

		// Verify the current value
		const currentValue = await bgImageInput.inputValue();
		expect(currentValue).toBe('test-bg.webp');

		// Verify we can edit the background image
		await bgImageInput.clear();
		await bgImageInput.fill('new-background.jpg');

		// Verify the value was set
		const bgImageValue = await bgImageInput.inputValue();
		expect(bgImageValue).toBe('new-background.jpg');

		// Verify color inputs still exist for other properties
		const colorInput = page.getByTestId('theme-color---primary-background');
		await expect(colorInput).toBeVisible();
		await expect(colorInput).toHaveAttribute('type', 'color');
		await expect(colorInput).not.toBeDisabled();
	});

	test('should disable theme selector when follow browser theme is enabled', async ({ page }) => {
		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.waitForTimeout(500);
		await page.getByTestId('menu-item-settings').click();
		await page.waitForTimeout(500);
		await page.getByTestId('settings-appearance').click();
		await page.waitForTimeout(300);

		// Theme selector should be enabled initially
		const themeSelector = page.getByTestId('theme switch');
		await expect(themeSelector).not.toBeDisabled();

		// Enable "Follow browser theme"
		const followBrowserSwitch = page.getByTestId('follow-browser-theme-switch');
		await followBrowserSwitch.click();
		await page.waitForTimeout(300);

		// Theme selector should now be disabled
		await expect(themeSelector).toBeDisabled();

		// Disable "Follow browser theme" again
		await followBrowserSwitch.click();
		await page.waitForTimeout(300);

		// Theme selector should be enabled again
		await expect(themeSelector).not.toBeDisabled();
	});

	test('should edit custom theme properties', async ({ page }) => {
		// Create a custom theme
		await page.goto('http://localhost:3000');
		await page.evaluate(() => {
			const customTheme = {
				name: 'Editable Theme',
				properties: {
					'--primary-foreground': '#222',
					'--primary-softer-background': '#ffe',
					'--primary-soft-background': '#fec',
					'--primary-background': '#fc1',
					'--primary-hard-background': '#fa0',
					'--primary-harder-background': '#d80',
					'--secondary-foreground': '#fff',
					'--secondary-softer-background': '#555',
					'--secondary-soft-background': '#444',
					'--secondary-background': '#222',
					'--secondary-hard-background': '#111',
					'--secondary-harder-background': '#000',
					'--default-foreground': '#000',
					'--default-background': '#fff',
					'--disabled-background': '#ddd',
					'--disabled-foreground': '#888',
					'--background-image': 'light.webp',
				},
			};
			const currentThemes = JSON.parse(localStorage.getItem('user_themes') || '[]');
			currentThemes.push(customTheme);
			localStorage.setItem('user_themes', JSON.stringify(currentThemes));
			localStorage.setItem('selected_theme_index', '2'); // Select the custom theme
		});

		await page.reload();

		// Open menu and settings
		await page.getByTestId('menu-button').click();
		await page.getByTestId('menu-item-settings').click();
		await page.getByTestId('settings-appearance').click();

		// Click edit button
		await page.getByTestId('theme-edit-button').click();

		// Edit theme name
		const nameInput = page.getByTestId('theme-name-input');
		await nameInput.clear();
		await nameInput.fill('Edited Theme');

		// Change a color property
		const primaryBgInput = page.getByTestId('theme-color---primary-background');
		await primaryBgInput.fill('#ff0000');

		// Navigate back
		await page.getByTestId('breadcrumb-appearance').click();

		// Verify changes persisted
		const themeSelector = page.getByTestId('theme switch');
		const options = await themeSelector.locator('option').allTextContents();
		expect(options).toContain('Edited Theme');

		// Verify color change applied
		const primaryBg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary-background'));
		expect(primaryBg.trim()).toBe('#ff0000');
	});
});
