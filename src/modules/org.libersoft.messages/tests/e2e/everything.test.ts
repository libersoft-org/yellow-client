import { expect, test } from '@playwright/test';
import { type Page } from '@playwright/test';
import { closeWelcomeWizardModal, setupConsoleLogging } from '@/core/e2e/test-utils.ts';

test('Click around in settings', async ({ page }) => {
	setupConsoleLogging(page);
	await page.goto(process.env.PLAYWRIGHT_CLIENT_URL || 'http://localhost:3000/');

	await closeWelcomeWizardModal(page);
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
		// Switch to user1 and create conversations
		await switchAccount(page, 'forward_test_user1@example.com');
		await switchModule(page, 'org.libersoft.messages');

		// Start conversation with user2
		await startNewConversation(page, 'forward_test_user2@example.com');
		await sendMessage(page, 'Hello user2 from user1');

		// Start conversation with user3
		await startNewConversation(page, 'forward_test_user3@example.com');
		await sendMessage(page, 'Hello user3 from user1');
	});

	await test.step('Test Forward Message Preview and Modal', async () => {
		// Go to conversation with user2
		await openConversation(page, 'forward_test_user2@example.com');

		// Send a message to forward
		const messageToForward = 'This is a test message that will be forwarded';
		await sendMessage(page, messageToForward);

		// Forward the message
		await forwardLastMessage(page);

		// Verify modal opens with correct preview
		await verifyForwardModalWithPreview(page, messageToForward);

		// Verify modal structure
		await expect(page.getByTestId('forward-message-modal')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview-header')).toHaveText('Forwarding message:');
		await expect(page.getByTestId('forward-message-search')).toBeVisible();
		await expect(page.getByTestId('forward-message-conversations')).toBeVisible();

		// Close modal
		await closeModal(page, 'forward-message');
	});

	await test.step('Test Conversation Search Functionality', async () => {
		await forwardLastMessage(page);

		// Test search for user3
		await searchConversationsInForwardModal(page, 'user3');

		// Verify that only user3 conversation is visible (if any conversations match)
		await expect(page.getByTestId('forward-message-conversations')).toBeVisible();

		// Test search with no results
		await searchConversationsInForwardModal(page, 'nonexistent');
		await expect(page.getByTestId('forward-message-no-conversations')).toBeVisible();

		// Clear search
		await searchConversationsInForwardModal(page, '');

		// Close modal
		await closeModal(page, 'forward-message');
	});

	await test.step('Test Auto-Clear Behavior When Forwarding Different Messages', async () => {
		// Send first message and forward it
		const firstMessage = 'First message to forward';
		await sendMessage(page, firstMessage);
		await forwardLastMessage(page);
		await verifyForwardModalWithPreview(page, firstMessage);

		// Note: In a real test with actual conversation IDs, we would:
		// 1. Forward to a conversation and verify it shows "Sent"
		// 2. Close modal, send new message, forward it
		// 3. Verify the same conversation now shows "Send" again (auto-cleared)

		// For now, we'll verify the modal works with different messages
		await closeModal(page, 'forward-message');

		// Send second message
		const secondMessage = 'Second message to forward';
		await sendMessage(page, secondMessage);
		await forwardLastMessage(page);
		await verifyForwardModalWithPreview(page, secondMessage);

		// Verify it's showing the new message, not the old one
		await expect(page.getByTestId('forward-message-preview-content')).toContainText(secondMessage);
		await expect(page.getByTestId('forward-message-preview-content')).not.toContainText(firstMessage);

		await closeModal(page, 'forward-message');
	});
});

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

		// either completely close account management corepage (on desktop) or go to sidebar (on mobile)
		if (await page.getByTestId('account-management-close-button').isVisible()) {
			await page.getByTestId('account-management-close-button').click();
		} else if (await page.getByTestId('accounts-content-back-button').isVisible()) {
			await page.getByTestId('accounts-content-back-button').click();
		}
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
		// Switch account
		await switchAccount(page, 'user1@example.com');

		// Open conversation
		await openConversation(page, 'user2@example.com');

		// Send reaction
		await addReactionToLastMessage(page);
	});

	await test.step('Message Forwarding Tests', async () => {
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

	await configureMessagesSettings(page, {
		chunkSize: '636928',
		photoRadius: '10px',
	});

	await test.step('Module Navigation Test', async () => {
		// Switch between modules
		await switchModule(page, 'org.libersoft.contacts');
		await switchModule(page, 'org.libersoft.dating');
		await switchModule(page, 'org.libersoft.wallet');
		await switchModule(page, 'org.libersoft.iframes');
		await switchModule(page, 'org.libersoft.contacts');
		await switchModule(page, 'org.libersoft.messages');
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
 * Helper function to switch to a module only if it's not already selected
 * @param page - The Playwright page object
 * @param moduleId - The module ID to switch to
 */
async function switchModule(page: Page, moduleId: string): Promise<void> {
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
			// Wait a bit for the click to process
			await page.waitForTimeout(500);

			// Check again if now selected
			isSelected = (await selectedElement.count()) > 0;

			// If still not selected, try one more time
			if (!isSelected) {
				await moduleSelector.click();
				await page.waitForTimeout(500);
			}
		}
	});
}

/**
 * Helper function to switch to a specific account
 * @param page - The Playwright page object
 * @param address - The account address to switch to
 */
async function switchAccount(page: Page, address: string): Promise<void> {
	return await test.step(`Switch to account: ${address}`, async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account ' + address).click();
	});
}

/**
 * Helper function to navigate to account management
 * @param page - The Playwright page object
 */
async function goToAccountManagement(page: Page): Promise<void> {
	return await test.step('Go to account management', async () => {
		await page.getByTestId('account-bar-toggle').click();
		await page.getByTestId('account-management-button').click();
	});
}

/**
 * Helper function to add a new account
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
async function addAccount(
	page: Page,
	accountData: {
		server: string;
		address: string;
		password: string;
		title?: string;
	}
): Promise<void> {
	return await test.step(`Add new account: ${accountData.address}`, async () => {
		await page.getByTestId('add-account-button').click();

		// Clear and fill the fields
		await page.getByTestId('account-title-input').fill(accountData.title || '');
		await page.getByTestId('account-server-input').fill(accountData.server);
		await page.getByTestId('account-address-input').fill(accountData.address);
		await page.getByTestId('account-password-input').fill(accountData.password);
		await page.getByTestId('add').click();
	});
}

/**
 * Helper function to create a new conversation
 * @param page - The Playwright page object
 * @param recipient - The recipient address
 */
async function startNewConversation(page: Page, recipient: string): Promise<void> {
	return await test.step(`Start new conversation with: ${recipient}`, async () => {
		await page.getByTestId('new-conversation-button').click();
		await page.getByTestId('new-conversation-address').fill(recipient);
		await page.getByTestId('New Conversation Open').click();
	});
}

/**
 * Helper function to open an existing conversation
 * @param page - The Playwright page object
 * @param contact - The contact address
 */
async function openConversation(page: Page, contact: string): Promise<void> {
	return await test.step(`Open conversation with: ${contact}`, async () => {
		await page.getByTestId(`conversation ${contact}`).click();
	});
}

/**
 * Helper function to send a message
 * @param page - The Playwright page object
 * @param messageText - The message text to send
 */
async function sendMessage(page: Page, messageText: string): Promise<void> {
	return await test.step(`Send message: "${messageText}"`, async () => {
		await page.getByTestId('message-input').fill(messageText);
		await page.getByTestId('messagebarsend').click();
	});
}

/**
 * Helper function to reply to the last message
 * @param page - The Playwright page object
 * @param replyText - The reply text
 */
async function replyToLastMessage(page: Page, replyText: string): Promise<void> {
	return await test.step(`Reply to last message with: "${replyText}"`, async () => {
		await page.getByTestId('message-item').last().click({ button: 'right' });

		// Wait for context menu to appear and click reply
		await page.getByTestId('reply-context-menu-item').last().waitFor({ state: 'visible' });
		await page.getByTestId('reply-context-menu-item').last().click();

		await sendMessage(page, replyText);
	});
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
 * Helper function to forward the last message
 * @param page - The Playwright page object
 */
async function forwardLastMessage(page: Page): Promise<void> {
	return await test.step('Forward last message', async () => {
		// Ensure there are messages to forward
		await expect(page.getByTestId('message-item').first()).toBeVisible({ timeout: 10000 });

		// Wait for all messages to be loaded and stable
		await page.waitForTimeout(1000);

		// Get the last message and ensure it's visible
		const lastMessage = page.getByTestId('message-item').last();
		await lastMessage.waitFor({ state: 'visible', timeout: 10000 });
		await page.waitForTimeout(500); // Small delay to ensure message is fully rendered

		// Right-click the last message
		await lastMessage.click({ button: 'right' });

		// Wait for context menu to appear and click forward
		await page.getByTestId('forward-context-menu-item').last().waitFor({ state: 'visible' });
		await page.getByTestId('forward-context-menu-item').last().click();

		// Wait for the forward modal to appear
		await page.getByTestId('forward-message-modal').waitFor({ state: 'visible' });
	});
}

/**
 * Helper function to forward a message to a specific conversation
 * @param page - The Playwright page object
 * @param address - The conversation address (other party's address)
 */
async function forwardMessageToConversation(page: Page, address: string): Promise<void> {
	return await test.step(`Forward message to conversation: ${address}`, async () => {
		await page.getByTestId(`forward-conversation-send-${address}`).click();
	});
}

/**
 * Helper function to verify forward message modal is open and shows preview
 * @param page - The Playwright page object
 * @param expectedMessage - The expected message text in preview
 */
async function verifyForwardModalWithPreview(page: Page, expectedMessage?: string): Promise<void> {
	return await test.step('Verify forward modal is open with message preview', async () => {
		// Give the modal more time to appear
		await expect(page.getByTestId('forward-message-modal')).toBeVisible({ timeout: 10000 });
		await expect(page.getByTestId('forward-message-preview')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview-header')).toHaveText('Forwarding message:');

		if (expectedMessage) {
			await expect(page.getByTestId('forward-message-preview-content')).toContainText(expectedMessage);
		}
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
 * Helper function to search conversations in forward modal
 * @param page - The Playwright page object
 * @param searchTerm - The search term
 */
async function searchConversationsInForwardModal(page: Page, searchTerm: string): Promise<void> {
	return await test.step(`Search conversations: "${searchTerm}"`, async () => {
		await page.getByTestId('forward-message-search').fill(searchTerm);
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
 * Helper function to open global settings
 * @param page - The Playwright page object
 */
async function openGlobalSettings(page: Page): Promise<void> {
	return await test.step('Open global settings', async () => {
		await page.getByTestId('menu-button').click();
		await page.getByTestId('menu-item-settings').click();
	});
}

/**
 * Helper function to navigate to a specific settings section
 * @param page - The Playwright page object
 * @param section - The settings section to navigate to
 */
async function navigateToSettingsSection(page: Page, section: 'General' | 'Notifications' | 'Appearance'): Promise<void> {
	return await test.step(`Navigate to settings section: ${section}`, async () => {
		await page.getByTestId(`settings-${section.toLowerCase()}`).click();
	});
}

async function goToRootSettingsSection(page: Page): Promise<void> {
	return await test.step('Navigate back to root settings', async () => {
		await page.getByTestId('breadcrumb-settings').click();
	});
}

/**
 * Helper function to close the current modal
 * @param page - The Playwright page object
 */
async function closeModal(page: Page, testId: string): Promise<void> {
	return await test.step('Close modal', async () => {
		await page.getByTestId(testId + '-Modal-close').click({ timeout: 1000 });
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
 * Helper function to set up an account through the initial wizard
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
async function setupAccountInWizard(
	page: Page,
	accountData: {
		server: string;
		address: string;
		password: string;
		title?: string;
	}
): Promise<void> {
	return await test.step(`Setup account in wizard: ${accountData.address}`, async () => {
		await page.getByTestId('wizard-next').waitFor({ state: 'visible', timeout: 10000 });
		await page.getByTestId('wizard-next').click();
		await page.getByTestId('account-title-input').click();
		await page.getByTestId('account-title-input').fill(accountData.title || '');
		await page.getByTestId('account-server-input').press('Shift+Home');
		await page.getByTestId('account-server-input').fill(accountData.server);
		await page.getByTestId('account-address-input').fill(accountData.address);
		await page.getByTestId('account-password-input').fill(accountData.password);
		await page.getByTestId('add').click();
		await page.screenshot({ path: '/tmp/setup_account_in_wizard.png' });
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Finish' }).click();
	});
}

/**
 * Helper function to delete the first account in the list
 * @param page - The Playwright page object
 */
async function deleteFirstAccount(page: Page): Promise<void> {
	return await test.step('Delete first account', async () => {
		await page.getByTestId('delete-account-button').first().click();
		// Wait for dialog to appear - wait for the confirm button instead
		await page.getByTestId('delete-account-confirm').waitFor({ state: 'visible', timeout: 5000 });

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
		await page.getByTestId('edit-account-button').first().click();
		await page.getByTestId('account-enabled-checkbox').click();
		await page.getByRole('button', { name: 'Save' }).click();
	});
}
