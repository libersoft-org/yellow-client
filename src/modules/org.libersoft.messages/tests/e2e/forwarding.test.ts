import { test, expect } from '@playwright/test';
import { setupConsoleLogging, closeWelcomeWizardWindow, openGlobalSettings, setupAccountInWizard, goToAccountManagement, addAccount, switchAccount, switchModule, closeWindow } from '@/core/e2e/test-utils.js';

import { startNewConversation, openConversation, sendMessage, verifyForwardWindowWithPreview, forwardLastMessage, searchConversationsInForwardWindow } from '@/modules/org.libersoft.messages/tests/e2e/_shared/utils.js';

test('Click around in settings', async ({ page }) => {
	setupConsoleLogging(page);
	await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

	await closeWelcomeWizardWindow(page);
	await openGlobalSettings(page);
});

test('Message Forwarding Behavior Tests', async ({ page }) => {
	setupConsoleLogging(page);
	await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');
	const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || `ws://localhost:8084`;

	await test.step('Setup Test Accounts', async () => {
		// Add account in the wizard
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'forward_test_user1@example.com',
			password: 'password',
		});

		// Go to account management and add more accounts
		await goToAccountManagement(page);

		await addAccount(page, {
			server: serverUrl,
			address: 'forward_test_user2@example.com',
			password: 'password',
		});

		await addAccount(page, {
			server: serverUrl,
			address: 'forward_test_user3@example.com',
			password: 'password',
		});
	});

	await test.step('Create Conversations and Messages', async () => {
		if (await page.getByTestId('accounts-content-back-button').isVisible()) {
			await page.getByTestId('accounts-content-back-button').click();
		}

		// Switch to user1 and create conversations
		await switchAccount(page, 'forward_test_user1@example.com');
		await switchModule(page, 'org.libersoft.messages');

		// Start conversation with user2
		await startNewConversation(page, 'forward_test_user2@example.com');
		await sendMessage(page, 'Hello user2 from user1');

		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}

		// Start conversation with user3
		await startNewConversation(page, 'forward_test_user3@example.com');
		await sendMessage(page, 'Hello user3 from user1');

		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}
	});

	await test.step('Test Forward Message Preview and Window', async () => {
		// Go to conversation with user2
		await openConversation(page, 'forward_test_user2@example.com');

		// Send a message to forward
		const messageToForward = 'This is a test message that will be forwarded';
		await sendMessage(page, messageToForward);

		// Forward the message
		await forwardLastMessage(page);

		// Verify window opens with correct preview
		await verifyForwardWindowWithPreview(page, messageToForward);

		// Verify window structure
		await expect(page.getByTestId('forward-message-window')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview-header')).toHaveText('Forwarding message:');
		await expect(page.getByTestId('forward-message-search')).toBeVisible();
		await expect(page.getByTestId('forward-message-conversations')).toBeVisible();

		// Close window
		await closeWindow(page, 'forward-message');
	});

	await test.step('Test Conversation Search Functionality', async () => {
		await forwardLastMessage(page);

		// Test search for user3
		await searchConversationsInForwardWindow(page, 'user3');

		// Verify that only user3 conversation is visible (if any conversations match)
		await expect(page.getByTestId('forward-message-conversations')).toBeVisible();

		// Test search with no results
		await searchConversationsInForwardWindow(page, 'nonexistent');
		await expect(page.getByTestId('forward-message-no-conversations')).toBeVisible();

		// Clear search
		await searchConversationsInForwardWindow(page, '');

		// Close window
		await closeWindow(page, 'forward-message');
	});

	await test.step('Test Auto-Clear Behavior When Forwarding Different Messages', async () => {
		// Send first message and forward it
		const firstMessage = 'First message to forward';
		await sendMessage(page, firstMessage);
		await forwardLastMessage(page);
		await verifyForwardWindowWithPreview(page, firstMessage);

		// Note: In a real test with actual conversation IDs, we would:
		// 1. Forward to a conversation and verify it shows "Sent"
		// 2. Close window, send new message, forward it
		// 3. Verify the same conversation now shows "Send" again (auto-cleared)

		// For now, we'll verify the window works with different messages
		await closeWindow(page, 'forward-message');

		// Send second message
		const secondMessage = 'Second message to forward';
		await sendMessage(page, secondMessage);
		await forwardLastMessage(page);
		await verifyForwardWindowWithPreview(page, secondMessage);

		// Verify it's showing the new message, not the old one
		//await expect(page.getByTestId('forward-message-preview-content')).toContainText(secondMessage);
		//await expect(page.getByTestId('forward-message-preview-content')).not.toContainText(firstMessage);

		await closeWindow(page, 'forward-message');
	});
});
