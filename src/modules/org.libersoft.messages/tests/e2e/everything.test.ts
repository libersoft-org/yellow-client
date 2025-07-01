import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { setupConsoleLogging, openGlobalSettings, setupAccountInWizard, goToAccountManagement, addAccount, switchAccount, switchModule, closeModal, goToRootSettingsSection, navigateToSettingsSection } from '@/core/e2e/test-utils.ts';

import { startNewConversation, openConversation, sendMessage, forwardLastMessage, forwardMessageToConversation, verifyForwardModalWithPreview, searchConversationsInForwardModal } from '@/modules/org.libersoft.messages/tests/e2e/_shared/utils.ts';

test('Complete End-to-End Application Test', async ({ page }) => {
	setupConsoleLogging(page);
	await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');
	const serverUrl = process.env.PLAYWRIGHT_SERVER_URL || `ws://localhost:8084`;

	await test.step('Initial Account Setup', async () => {
		// Add account in the wizard
		await setupAccountInWizard(page, {
			server: serverUrl,
			address: 'user1@example.com',
			password: 'password',
		});
	});

	await test.step('Account Management', async () => {
		// Switch to account
		await switchAccount(page, 'user1@example.com');

		// Go to account management
		await goToAccountManagement(page);

		// Add new account
		await addAccount(page, {
			server: serverUrl,
			address: 'user2@example.com',
			password: 'password',
		});

		await closeAccountManagementCorepage(page);
	});

	await test.step('First Conversation', async () => {
		// Switch account
		await switchAccount(page, 'user1@example.com');

		// Switch module
		await switchModule(page, 'org.libersoft.messages');

		// Start a new conversation
		await startNewConversation(page, 'user2@example.com');

		// Send a message
		await sendMessage(page, 'blabla bla');
	});

	await test.step('Receiving and Replying to Messages', async () => {
		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}

		await switchAccount(page, 'user2@example.com');
		await switchModule(page, 'org.libersoft.messages');
		await openConversation(page, 'user1@example.com');

		// Reply to a message
		// This could use two improvements:
		// last() gets the last message, which might not be the exact message we sent above, especially if we want to consider running the tests without always clearing and re-populating the database, which we dont want to do always (like during test development).
		// the other improvement is that we should test that what we click that particular message, (say we identify it by its uuid), we should check that it is the corresponding context menu that becomes visible. But we should probably mainly rewrite ContextMenu to make it only render when it's open, rather than rendering in invisible state. If i'm not mistaken, the test here could be clicking on an invisible item.
		await replyToLastMessage(page, 'ble ble ble');
	});

	await test.step('Message Reactions', async () => {
		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}

		// Switch account
		await switchAccount(page, 'user1@example.com');

		// Open conversation
		await openConversation(page, 'user2@example.com');

		// Send reaction
		await addReactionToLastMessage(page);
	});

	await test.step('Message Forwarding Tests', async () => {
		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}

		// Ensure we're in the right context - user1 talking to user2
		await switchAccount(page, 'user1@example.com');
		await switchModule(page, 'org.libersoft.messages');
		await openConversation(page, 'user2@example.com');

		// Send a test message to forward
		const forwardTestMessage = 'This message will be forwarded';
		await sendMessage(page, forwardTestMessage);

		// Test basic forwarding functionality
		await test.step('Basic forward modal functionality', async () => {
			await forwardLastMessage(page);
			await verifyForwardModalWithPreview(page, forwardTestMessage);

			// Verify search functionality
			await searchConversationsInForwardModal(page, 'user3');

			// Clear search to see all conversations
			await searchConversationsInForwardModal(page, '');

			// Close modal for now
			await closeForwardModal(page);
		});
	});

	await test.step('Additional Conversation', async () => {
		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}

		// Switch account
		await switchAccount(page, 'user1@example.com');

		// Switch module
		await switchModule(page, 'org.libersoft.messages');

		// Start a new conversation with user3
		await startNewConversation(page, 'user3@example.com');

		// Send a message
		await sendMessage(page, 'hi 3');
	});

	await test.step('Advanced Message Forwarding Tests', async () => {
		if (await page.getByTestId('profile-bar-back-button').isVisible()) {
			await page.getByTestId('profile-bar-back-button').click();
		}

		// Switch back to conversation with user2
		await switchAccount(page, 'user1@example.com');
		await switchModule(page, 'org.libersoft.messages');
		await openConversation(page, 'user2@example.com');

		// Send a test message for advanced forwarding tests
		const advancedForwardMessage = 'Advanced forward test message';
		await sendMessage(page, advancedForwardMessage);

		await test.step('Forward to multiple conversations and test auto-clear', async () => {
			// Forward the message
			await forwardLastMessage(page);
			await verifyForwardModalWithPreview(page, advancedForwardMessage);

			// Test search filtering to find user3 conversation
			await searchConversationsInForwardModal(page, 'user3');

			// Forward to user3 conversation (using the address as conversation identifier)
			await forwardMessageToConversation(page, 'user3@example.com');
			await verifyConversationSendState(page, 'user3@example.com', true);

			// Try to send again - should be disabled
			await verifyConversationSendState(page, 'user3@example.com', true);

			// Clear search to see all conversations
			await searchConversationsInForwardModal(page, '');

			// Close this forward modal
			await closeForwardModal(page);

			// Send another message to test auto-clear behavior
			const secondMessage = 'Second message for auto-clear test';
			await sendMessage(page, secondMessage);

			// Forward the new message
			await forwardLastMessage(page);
			await verifyForwardModalWithPreview(page, secondMessage);

			// Verify that previously sent conversations are cleared (should show "Send" again)
			await verifyConversationSendState(page, 'user3@example.com', false);

			// Close modal
			await closeForwardModal(page);
		});

		await test.step('Test forward modal search with no results', async () => {
			await forwardLastMessage(page);

			// Search for non-existent conversation
			await searchConversationsInForwardModal(page, 'nonexistent_user');

			// Verify no conversations message is shown
			await expect(page.getByTestId('forward-message-no-conversations')).toBeVisible();
			await expect(page.getByTestId('forward-message-no-conversations')).toHaveText('No conversations were found');

			// Clear search to restore conversations list
			await searchConversationsInForwardModal(page, '');

			// Close modal
			await closeModal(page, 'forward-message');
		});
	});

	if (await page.getByTestId('profile-bar-back-button').isVisible()) {
		await page.getByTestId('profile-bar-back-button').click();
	}

	await configureMessagesSettings(page, {
		chunkSize: '636928',
		photoRadius: '10px',
	});

	await test.step('Module Navigation Test', async () => {
		// Switch between modules
		//await switchModule(page, 'org.libersoft.contacts');
		//await switchModule(page, 'org.libersoft.dating');
		//await switchModule(page, 'org.libersoft.wallet');
		//await switchModule(page, 'org.libersoft.iframes');
		//await switchModule(page, 'org.libersoft.contacts');
		//await switchModule(page, 'org.libersoft.messages');
	});

	await test.step('Account Management Operations', async () => {
		// Go to account management
		await goToAccountManagement(page);

		// Add a new account with user3
		await addAccount(page, {
			server: serverUrl,
			address: 'user3@example.com',
			password: 'password',
		});

		// Export all accounts
		//const download1 = await exportAccounts(page);

		// Delete account
		await deleteFirstAccount(page);

		// Disable account
		await toggleFirstAccountEnabled(page);
	});

	await test.step('Messages Settings', async () => {
		if (await page.getByTestId('accounts-content-close-button').isVisible()) {
			await page.getByTestId('accounts-content-close-button').click();
		} else if (await page.getByTestId('accounts-content-back-button').isVisible()) {
			await page.getByTestId('accounts-content-back-button').click();
		}

		// Switch account
		await switchAccount(page, 'user3@example.com');
		await new Promise(resolve => setTimeout(resolve, 5000));

		await switchModule(page, 'org.libersoft.messages');

		// Open messages settings
		await configureMessagesSettings(page, {
			chunkSize: '2756608',
		});
	});

	await test.step('Global Settings Navigation', async () => {
		await openGlobalSettings(page);

		// Navigate to Notifications and toggle settings
		await navigateToSettingsSection(page, 'Notifications');
		await test.step('Toggle notification settings', async () => {
			const notificationsToggle = page.getByTestId('notifications enabled toggle');
			const soundToggle = page.getByLabel('Notification sound');
			await notificationsToggle.click();
			await soundToggle.click();
		});

		// Go back to root
		await goToRootSettingsSection(page);

		// Navigate to Appearance and change theme
		await navigateToSettingsSection(page, 'Appearance');
		await test.step('Change theme in Appearance settings', async () => {
			// First disable "Follow browser theme" to enable manual theme selection
			const followBrowserThemeSwitch = page.getByTestId('follow-browser-theme-switch');
			await followBrowserThemeSwitch.waitFor({ state: 'visible' });
			await followBrowserThemeSwitch.click();

			// Now the theme selector should be enabled
			const themeSelect = page.getByTestId('theme switch');
			await expect(themeSelect).toBeEnabled();
			await expect(themeSelect).toHaveValue('0'); // Light
			await themeSelect.selectOption({ label: 'Dark' });
			await expect(themeSelect).toHaveValue('1'); // Dark
			await themeSelect.selectOption({ label: 'Light' });
			await expect(themeSelect).toHaveValue('0'); // Back to Light
		});

		// Go back to root and re-enter Notifications
		await goToRootSettingsSection(page);
		await navigateToSettingsSection(page, 'Notifications');

		// Close settings modal
		await closeModal(page, 'global-settings');
	});
});

/**
 * Helper function to reply to a specific message by UID
 * @param page - The Playwright page object
 * @param messageUid - The UID of the message to reply to (optional, uses last message if not provided)
 * @param replyText - The reply text
 * @returns The UID of the reply message
 */
async function replyToMessage(page: Page, replyText: string, messageUid?: string): Promise<string | null> {
	return await test.step(`Reply to message ${messageUid ? `(UID: ${messageUid})` : '(last message)'} with: "${replyText}"`, async () => {
		let targetMessageUid = messageUid;

		if (!targetMessageUid) {
			// Get the last message and its UID
			const lastMessage = page.getByTestId('message-item').last();
			targetMessageUid = await lastMessage.getAttribute('data-uid');
			if (!targetMessageUid) {
				throw new Error('Could not find UID for last message');
			}

			// Right-click the last message
			await lastMessage.scrollIntoViewIfNeeded();
			await lastMessage.click({ button: 'right' });
		} else {
			// Click on specific message by UID
			await await page.locator(`[data-testid="message-item"][data-uid="${messageUid}"]`).scrollIntoViewIfNeeded();
			await page.locator(`[data-testid="message-item"][data-uid="${messageUid}"]`).click({ button: 'right' });
		}

		// Use the unique reply context menu item for this message
		await page.getByTestId(`message-context-menu-${targetMessageUid}-reply`).waitFor({ state: 'visible' });
		await page.getByTestId(`message-context-menu-${targetMessageUid}-reply`).click();

		return await sendMessage(page, replyText);
	});
}

/**
 * Helper function to reply to the last message (backwards compatibility)
 * @param page - The Playwright page object
 * @param replyText - The reply text
 */
async function replyToLastMessage(page: Page, replyText: string): Promise<string | null> {
	return replyToMessage(page, replyText);
}

/**
 * Helper function to add a reaction to the last message
 * @param page - The Playwright page object
 */
async function addReactionToLastMessage(page: Page): Promise<void> {
	return await test.step('Add reaction to last message', async () => {
		await page.getByTestId('message-reaction-menu-button').last().click();
		await page.getByTestId('message-reaction-emoji-button').last().click();
	});
}

/**
 * Helper function to verify conversation send button state
 * @param page - The Playwright page object
 * @param address - The conversation address (other party's address)
 * @param shouldBeSent - Whether the button should show "Sent" state
 */
async function verifyConversationSendState(page: Page, address: string, shouldBeSent: boolean): Promise<void> {
	return await test.step(`Verify conversation ${address} send state: ${shouldBeSent ? 'sent' : 'not sent'}`, async () => {
		const button = page.getByTestId(`forward-conversation-send-${address}`);
		// Use a more flexible text matcher that handles whitespace
		await expect(button).toContainText(shouldBeSent ? 'Sent' : 'Send');

		if (shouldBeSent) {
			await expect(button).toBeDisabled();
		} else {
			await expect(button).toBeEnabled();
		}
	});
}

/**
 * Helper function to open messages settings and configure them
 * @param page - The Playwright page object
 * @param settings - Object containing settings configuration
 */
async function configureMessagesSettings(
	page: Page,
	settings: {
		chunkSize?: string;
		photoRadius?: string;
	}
): Promise<void> {
	return await test.step('Configure messages settings', async () => {
		await page.getByTestId('messages-settings-button').click();

		if (settings.chunkSize) {
			await page.getByTestId('chunk-size').evaluate((el: HTMLInputElement, value) => (el.value = value), settings.chunkSize);
		}

		if (settings.photoRadius) {
			await page.getByRole('combobox').selectOption(settings.photoRadius);
		}

		await closeModal(page, 'messages-settings');
	});
}

/**
 * Helper function to close forward message modal specifically
 * @param page - The Playwright page object
 */
async function closeForwardModal(page: Page): Promise<void> {
	return await closeModal(page, 'forward-message');
}

/**
 * Helper function to delete the first account in the list
 * @param page - The Playwright page object
 */
async function deleteFirstAccount(page: Page): Promise<void> {
	return await test.step('Delete first account', async () => {
		if (await page.getByTestId('accounts-content-accordion-expand-0').isVisible()) {
			await page.getByTestId('accounts-content-accordion-expand-0').click();
		} else {
			await page.getByTestId('accounts-content-accordion-collapse-0').isVisible();
		}

		await page.getByTestId('delete-account-button').first().click();
		// Wait for dialog to appear - wait for the confirm button instead
		await page.getByTestId('delete-account-confirm').waitFor({ state: 'visible' });

		// Verify dialog content shows proper text and doesn't show "undefined"
		const dialogBody = await page.locator('.modal .body').textContent();
		expect(dialogBody).toMatch(/Would you like to delete the account/);
		expect(dialogBody).not.toContain('undefined');

		// Verify the dialog shows the specific account address
		expect(dialogBody).toContain('user1@example.com');

		await page.getByTestId('delete-account-confirm').click();
	});
}

/**
 * Helper function to toggle the enabled state of the first account
 * @param page - The Playwright page object
 */
async function toggleFirstAccountEnabled(page: Page): Promise<void> {
	return await test.step('Toggle first account enabled state', async () => {
		if (await page.getByTestId('accounts-content-accordion-expand-0').isVisible()) {
			await page.getByTestId('accounts-content-accordion-expand-0').click();
		} else {
			await page.getByTestId('accounts-content-accordion-collapse-0').isVisible();
		}

		await page.getByTestId('edit-account-button').first().click();
		await page.getByTestId('account-enabled-checkbox').click();
		await page.getByRole('button', { name: 'Save' }).click();
	});
}

async function closeAccountManagementCorepage(page: Page): Promise<void> {
	// either completely close account management corepage (on desktop) or go to sidebar (on mobile)
	if (await page.getByTestId('accounts-content-close-button').isVisible()) {
		await page.getByTestId('accounts-content-close-button').click();
	} else if (await page.getByTestId('accounts-content-back-button').isVisible()) {
		await page.getByTestId('accounts-content-back-button').click();
	}
}
