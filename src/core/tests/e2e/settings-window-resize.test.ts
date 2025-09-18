import { test, expect } from '@playwright/test';
import { closeWelcomeWizardWindow, setupConsoleLogging, openGlobalSettings, closeWindow } from './test-utils.ts';

test.describe.parallel('Settings Window Resize Behavior', () => {
	// Helper function to get common test elements and data
	const getTestElements = async page => {
		const menuItems = [
			{ testId: 'settings-general', title: 'General' },
			{ testId: 'settings-modules', title: 'Modules' },
			{ testId: 'settings-appearance', title: 'Appearance' },
			{ testId: 'settings-notifications', title: 'Notifications' },
		];

		const checkMenuItemsVisible = async () => {
			for (const item of menuItems) {
				const menuItem = page.getByTestId(item.testId);
				await expect(menuItem).toBeVisible();
			}
		};

		const settingsWindow = page.getByTestId('global-settings-Window');
		const dragHandle = settingsWindow.locator('.header');
		const viewport = page.viewportSize();
		const windowBox = await settingsWindow.boundingBox();

		return { menuItems, checkMenuItemsVisible, settingsWindow, dragHandle, viewport, windowBox };
	};

	test.beforeEach(async ({ page }) => {
		setupConsoleLogging(page);
		await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');
		await closeWelcomeWizardWindow(page);
	});

	test('settings window moves max 10px when browser resizes by 10px', async ({ page }) => {
		// Open settings window
		await openGlobalSettings(page);

		// Wait for settings window to be fully visible
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		// Get initial position of settings window
		const settingsWindow = page.getByTestId('global-settings-Window');
		const initialBox = await settingsWindow.boundingBox();

		expect(initialBox).not.toBeNull();
		if (!initialBox) return;

		const initialX = initialBox.x;
		const initialY = initialBox.y;

		// Get initial browser viewport size
		const initialViewport = page.viewportSize();
		expect(initialViewport).not.toBeNull();
		if (!initialViewport) return;

		// Resize browser window by 10px in width and height
		await page.setViewportSize({
			width: initialViewport.width + 10,
			height: initialViewport.height + 10,
		});

		// Wait for resize to complete
		await page.waitForTimeout(100);

		// Get new position of settings window
		const newBox = await settingsWindow.boundingBox();
		expect(newBox).not.toBeNull();
		if (!newBox) return;

		const newX = newBox.x;
		const newY = newBox.y;

		// Calculate movement
		const moveX = newX - initialX;
		const moveY = newY - initialY;

		// Assert that settings window moved no more than 10px down
		expect(moveX).toBeGreaterThanOrEqual(0);
		expect(moveY).toBeGreaterThanOrEqual(0);
		expect(moveX).toBeLessThanOrEqual(10);
		expect(moveY).toBeLessThanOrEqual(10);

		// Test resize in opposite direction
		await page.setViewportSize({
			width: initialViewport.width - 10,
			height: initialViewport.height - 10,
		});

		await page.waitForTimeout(100);

		// Get position after shrinking
		const shrunkBox = await settingsWindow.boundingBox();
		expect(shrunkBox).not.toBeNull();
		if (!shrunkBox) return;

		const shrunkX = shrunkBox.x;
		const shrunkY = shrunkBox.y;

		// Calculate movement from initial position
		const shrinkMoveX = shrunkX - initialX;
		const shrinkMoveY = shrunkY - initialY;

		// Assert that settings window moved no more than 10px when shrinking
		expect(shrinkMoveX).toBeLessThanOrEqual(0);
		expect(shrinkMoveY).toBeLessThanOrEqual(0);
		expect(shrinkMoveX).toBeGreaterThanOrEqual(-10);
		expect(shrinkMoveY).toBeGreaterThanOrEqual(-10);

		// Close settings window
		await closeWindow(page, 'global-settings');
	});

	test('all four settings menu items remain visible after window resize', async ({ page }) => {
		// Open settings window
		await openGlobalSettings(page);

		// Wait for settings window to be fully visible
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		// Define the four expected menu items based on Settings.svelte
		const menuItems = [
			{ testId: 'settings-general', title: 'General' },
			{ testId: 'settings-modules', title: 'Modules' },
			{ testId: 'settings-appearance', title: 'Appearance' },
			{ testId: 'settings-notifications', title: 'Notifications' },
		];

		// Function to check all menu items are visible
		const checkMenuItemsVisible = async () => {
			for (const item of menuItems) {
				const menuItem = page.getByTestId(item.testId);
				await expect(menuItem).toBeVisible();
			}
		};

		// Check initial visibility
		await checkMenuItemsVisible();

		// Get settings window dimensions for minimum size test
		const settingsWindow = page.getByTestId('global-settings-Window');
		const settingsBox = await settingsWindow.boundingBox();
		expect(settingsBox).not.toBeNull();
		if (!settingsBox) return;

		// Test various reasonable resolutions
		const resolutions = [
			{ width: 1920, height: 1080 }, // Full HD
			{ width: 1366, height: 768 }, // Common laptop
			{ width: 1280, height: 720 }, // HD
			{ width: 1024, height: 768 }, // Older standard
			{ width: 800, height: 600 }, // Minimum reasonable
			// Test resizing down to the size of the settings window
			{ width: Math.ceil(settingsBox.width), height: Math.ceil(settingsBox.height) },
			// Test slightly larger than settings window
			{ width: Math.ceil(settingsBox.width + 50), height: Math.ceil(settingsBox.height + 50) },
		];

		for (const resolution of resolutions) {
			await page.setViewportSize(resolution);
			await page.waitForTimeout(100); // Wait for resize

			// Check that all menu items are still visible
			await checkMenuItemsVisible();
		}

		// Test incremental resizing (simulating user dragging window)
		const initialViewport = page.viewportSize();
		expect(initialViewport).not.toBeNull();
		if (!initialViewport) return;

		// Gradually resize down
		for (let i = 0; i < 5; i++) {
			await page.setViewportSize({
				width: initialViewport.width - i * 50,
				height: initialViewport.height - i * 30,
			});
			await page.waitForTimeout(50);
			await checkMenuItemsVisible();
		}

		// Test rapid resizing
		for (let i = 0; i < 3; i++) {
			await page.setViewportSize({
				width: 1200 + i * 100,
				height: 800 + i * 50,
			});
			await page.waitForTimeout(50);
			await checkMenuItemsVisible();
		}

		// Close settings window
		await closeWindow(page, 'global-settings');
	});

	test('settings window remains functional after multiple resizes', async ({ page }) => {
		// Open settings window
		await openGlobalSettings(page);

		// Wait for settings window to be fully visible
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		// Perform multiple rapid resizes
		const resizes = [
			{ width: 1200, height: 800 },
			{ width: 1500, height: 900 },
			{ width: 1000, height: 700 },
			{ width: 1300, height: 850 },
			{ width: 1100, height: 750 },
		];

		for (const resize of resizes) {
			await page.setViewportSize(resize);
			await page.waitForTimeout(50);
		}

		// Test that settings navigation still works after resizes
		await page.getByTestId('settings-appearance').click();
		await expect(page.getByTestId('global-settings-content-appearance')).toBeVisible();

		// Go back to main settings
		await page.getByTestId('breadcrumb-settings').click();
		await expect(page.getByTestId('settings-general')).toBeVisible();

		// Test another section
		await page.getByTestId('settings-notifications').click();
		await expect(page.getByTestId('global-settings-content-notifications')).toBeVisible();

		// Close settings window
		await closeWindow(page, 'global-settings');
	});

	test('all menu items remain visible after dragging window to random locations', async ({ page }) => {
		await openGlobalSettings(page);
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		const { checkMenuItemsVisible, dragHandle, viewport, windowBox } = await getTestElements(page);
		expect(viewport).not.toBeNull();
		expect(windowBox).not.toBeNull();
		if (!viewport || !windowBox) return;

		await checkMenuItemsVisible();

		// Generate random positions within viewport bounds
		const randomPositions: { x: number; y: number }[] = [];
		for (let i = 0; i < 8; i++) {
			const randomX = Math.random() * (viewport.width - windowBox.width);
			const randomY = Math.random() * (viewport.height - windowBox.height);
			randomPositions.push({ x: randomX, y: randomY });
		}

		// Test dragging to each random position
		for (const position of randomPositions) {
			await dragHandle.hover();
			await page.mouse.down();
			await page.mouse.move(position.x + windowBox.width / 2, position.y + 20);
			await page.mouse.up();
			await page.waitForTimeout(100);
			await checkMenuItemsVisible();
		}

		await closeWindow(page, 'global-settings');
	});

	test('all menu items remain visible after dragging window to extreme positions', async ({ page }) => {
		await openGlobalSettings(page);
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		const { checkMenuItemsVisible, dragHandle, viewport, windowBox } = await getTestElements(page);
		expect(viewport).not.toBeNull();
		expect(windowBox).not.toBeNull();
		if (!viewport || !windowBox) return;

		await checkMenuItemsVisible();

		// Test extreme positions (corners and edges)
		const extremePositions = [
			{ x: 0, y: 0 }, // Top-left corner
			{ x: viewport.width - windowBox.width, y: 0 }, // Top-right corner
			{ x: 0, y: viewport.height - windowBox.height }, // Bottom-left corner
			{ x: viewport.width - windowBox.width, y: viewport.height - windowBox.height }, // Bottom-right corner
			{ x: (viewport.width - windowBox.width) / 2, y: 0 }, // Top center
			{ x: (viewport.width - windowBox.width) / 2, y: viewport.height - windowBox.height }, // Bottom center
			{ x: 0, y: (viewport.height - windowBox.height) / 2 }, // Left center
			{ x: viewport.width - windowBox.width, y: (viewport.height - windowBox.height) / 2 }, // Right center
		];

		for (const position of extremePositions) {
			await dragHandle.hover();
			await page.mouse.down();
			await page.mouse.move(position.x + windowBox.width / 2, position.y + 20);
			await page.mouse.up();
			await page.waitForTimeout(100);
			await checkMenuItemsVisible();
		}

		await closeWindow(page, 'global-settings');
	});

	test('window drag is constrained when attempting to move outside viewport bounds', async ({ page }) => {
		await openGlobalSettings(page);
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		const { checkMenuItemsVisible, settingsWindow, dragHandle, viewport } = await getTestElements(page);
		expect(viewport).not.toBeNull();
		if (!viewport) return;

		await checkMenuItemsVisible();

		// Test dragging far outside viewport bounds (should be constrained)
		const outsidePositions = [
			{ x: -1000, y: -1000 }, // Far outside top-left
			{ x: viewport.width + 1000, y: -1000 }, // Far outside top-right
			{ x: -1000, y: viewport.height + 1000 }, // Far outside bottom-left
			{ x: viewport.width + 1000, y: viewport.height + 1000 }, // Far outside bottom-right
			{ x: viewport.width / 2, y: -2000 }, // Way outside top
			{ x: viewport.width / 2, y: viewport.height + 2000 }, // Way outside bottom
			{ x: -2000, y: viewport.height / 2 }, // Way outside left
			{ x: viewport.width + 2000, y: viewport.height / 2 }, // Way outside right
			{ x: -5000, y: -5000 }, // Extremely far outside
			{ x: viewport.width + 5000, y: viewport.height + 5000 }, // Extremely far outside
		];

		for (const position of outsidePositions) {
			await dragHandle.hover();
			await page.mouse.down();
			await page.mouse.move(position.x, position.y);
			await page.mouse.up();
			await page.waitForTimeout(100);

			// Get window position after attempted outside drag
			const draggedBox = await settingsWindow.boundingBox();
			expect(draggedBox).not.toBeNull();
			if (!draggedBox) return;

			// Verify window stayed within bounds (title bar must be fully visible)
			expect(draggedBox.x).toBeGreaterThanOrEqual(0);
			expect(draggedBox.y).toBeGreaterThanOrEqual(0);
			expect(draggedBox.x + draggedBox.width).toBeLessThanOrEqual(viewport.width + 1);
			expect(draggedBox.y + draggedBox.height).toBeLessThanOrEqual(viewport.height + 1);

			await checkMenuItemsVisible();
		}

		await closeWindow(page, 'global-settings');
	});

	test('all menu items remain visible during rapid dragging sequences', async ({ page }) => {
		await openGlobalSettings(page);
		await page.getByTestId('global-settings-Window').waitFor({ state: 'visible' });

		const { checkMenuItemsVisible, dragHandle, viewport, windowBox } = await getTestElements(page);
		expect(viewport).not.toBeNull();
		expect(windowBox).not.toBeNull();
		if (!viewport || !windowBox) return;

		await checkMenuItemsVisible();

		// Test rapid dragging sequence
		for (let i = 0; i < 10; i++) {
			const quickX = Math.random() * (viewport.width - windowBox.width);
			const quickY = Math.random() * (viewport.height - windowBox.height);

			await dragHandle.hover();
			await page.mouse.down();
			await page.mouse.move(quickX + windowBox.width / 2, quickY + 20);
			await page.mouse.up();
			await page.waitForTimeout(50);
			await checkMenuItemsVisible();
		}

		await closeWindow(page, 'global-settings');
	});
});
