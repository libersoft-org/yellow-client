import { expect, type Page, test } from '@playwright/test';

/**
 * Helper function to create a new conversation
 * @param page - The Playwright page object
 * @param recipient - The recipient address
 */
export async function startNewConversation(page: Page, recipient: string): Promise<void> {
	return await test.step(`Start new conversation with: ${recipient}`, async () => {
		await page.getByTestId('new-conversation-button').first().click({ force: true });
		await page.getByTestId('new-conversation-address').fill(recipient);
		await page.getByTestId('New Conversation Open').click();
	});
}

/**
 * Helper function to open an existing conversation
 * @param page - The Playwright page object
 * @param contact - The contact address
 */
export async function openConversation(page: Page, contact: string): Promise<void> {
	return await test.step(`Open conversation with: ${contact}`, async () => {
		await page.getByTestId(`conversation ${contact}`).click();
	});
}

/**
 * Helper function to send a message
 * @param page - The Playwright page object
 * @param messageText - The message text to send
 * @returns The UID of the sent message
 */
export async function sendMessage(page: Page, messageText: string): Promise<string | null> {
	return await test.step(`Send message: "${messageText}"`, async () => {
		await page.getByTestId('message-input').fill(messageText);
		await page.getByTestId('messagebarsend').click();

		// Wait a moment for the message to be sent and the UID to be set
		await page.waitForTimeout(100);

		// Get the UID from the message-bar element
		const uid = await page.locator('.message-bar').getAttribute('data-sent-message-uid');
		return uid;
	});
}

/**
 * Helper function to forward the last message (backwards compatibility)
 * @param page - The Playwright page object
 */
export async function forwardLastMessage(page: Page): Promise<void> {
	return forwardMessage(page);
}

/**
 * Helper function to forward a message to a specific conversation
 * @param page - The Playwright page object
 * @param address - The conversation address (other party's address)
 */
export async function forwardMessageToConversation(page: Page, address: string): Promise<void> {
	return await test.step(`Forward message to conversation: ${address}`, async () => {
		await page.getByTestId(`forward-conversation-send-${address}`).click();
	});
}

/**
 * Helper function to forward a specific message by UID
 * @param page - The Playwright page object
 * @param messageUid - The UID of the message to forward (optional, uses last message if not provided)
 */
export async function forwardMessage(page: Page, messageUid?: string): Promise<void> {
	return await test.step(`Forward message ${messageUid ? `(UID: ${messageUid})` : '(last message)'}`, async () => {
		let targetMessageUid = messageUid;

		if (!targetMessageUid) {
			// Ensure there are messages to forward
			await expect(page.getByTestId('message-item').first()).toBeVisible();

			// Wait for all messages to be loaded and stable
			await page.waitForTimeout(1000);

			// Get the last message and its UID
			const lastMessage = page.getByTestId('message-item').last();
			//await lastMessage.waitFor({ state: 'visible', timeout: 10000 });
			//await page.waitForTimeout(500); // Small delay to ensure message is fully rendered

			// Get the UID from the last message
			targetMessageUid = (await lastMessage.getAttribute('data-uid')) ?? undefined;
			if (!targetMessageUid) {
				throw new Error('Could not find UID for last message');
			}

			// Right-click the last message
			await lastMessage.scrollIntoViewIfNeeded();
			await lastMessage.click({ button: 'right', force: true });
		} else {
			// Find and right-click the specific message by UID
			const specificMessage = page.locator(`[data-testid="message-item"][data-uid="${messageUid}"]`);
			await specificMessage.click({ button: 'right', force: true });
		}

		await page.getByTestId(`message-context-menu-${targetMessageUid}-forward`).click({ force: true });

		// Wait for the forward window to appear
		await page.getByTestId('forward-message-window').waitFor({ state: 'visible' });
	});
}

/**
 * Helper function to verify forward message window is open and shows preview
 * @param page - The Playwright page object
 * @param expectedMessage - The expected message text in preview
 */
export async function verifyForwardWindowWithPreview(page: Page, expectedMessage?: string): Promise<void> {
	return await test.step('Verify forward window is open with message preview', async () => {
		// Give the window more time to appear
		await expect(page.getByTestId('forward-message-window')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview')).toBeVisible();
		await expect(page.getByTestId('forward-message-preview-header')).toHaveText('Forwarding message:');

		if (expectedMessage) {
			// fixme: we need to obtain message uid's when sending messages, and we need to implement a robust message "search" by scrolling through the messages and looking for the data-uid.
			//await expect(page.getByTestId('forward-message-preview-content')).toContainText(expectedMessage);
		}
	});
}

/**
 * Helper function to search conversations in forward window
 * @param page - The Playwright page object
 * @param searchTerm - The search term
 */
export async function searchConversationsInForwardWindow(page: Page, searchTerm: string): Promise<void> {
	return await test.step(`Search conversations: "${searchTerm}"`, async () => {
		await page.getByTestId('forward-message-search').fill(searchTerm);
	});
}
