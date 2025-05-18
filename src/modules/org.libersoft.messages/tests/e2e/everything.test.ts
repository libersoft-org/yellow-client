import { test, expect } from '@playwright/test';
import { type Page } from '@playwright/test';

/**
 * Helper function to switch to a module only if it's not already selected
 * @param page - The Playwright page object
 * @param moduleId - The module ID to switch to
 */
async function switchModule(page: Page, moduleId: string): Promise<void> {
 return await test.step(`Switch to module: ${moduleId}`, async () => {
  const moduleSelector = page.getByTestId(`ModuleBarItem-${moduleId}`);
  const selectedElement = moduleSelector.locator('div.selected');

  // Click the module selector to possibly switch away from core page - this is a workaround for proper active page management in core.
  await moduleSelector.click();
  await moduleSelector.click();

  // Check if module is already selected
  const isSelected = (await selectedElement.count()) > 0;

  // Only click if not already selected
  if (!isSelected) {
   await moduleSelector.click();
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
  await page.getByRole('button', { name: 'Account management Account' }).click();
 });
}

/**
 * Helper function to add a new account
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
async function addAccount(page: Page, accountData: { server: string; address: string; password: string; title?: string }): Promise<void> {
 return await test.step(`Add new account: ${accountData.address}`, async () => {
  await page.getByRole('button', { name: 'Add a new account Add a new' }).click();

  // Clear and fill the fields
  await page.getByRole('textbox', { name: 'Title:' }).fill(accountData.title || '');
  await page.getByRole('textbox', { name: 'Server:' }).fill(accountData.server);
  await page.getByRole('textbox', { name: 'Address:' }).fill(accountData.address);
  await page.getByRole('textbox', { name: 'Password:' }).fill(accountData.password);
  await page.getByTestId('save').click();
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
 * Helper function to open messages settings and configure them
 * @param page - The Playwright page object
 * @param settings - Object containing settings configuration
 */
async function configureMessagesSettings(page: Page, settings: { chunkSize?: string; fontSize?: string }): Promise<void> {
 return await test.step('Configure messages settings', async () => {
  await page.getByTestId('messages-settings-button').click();

  if (settings.chunkSize) {
   await page.getByRole('slider').fill(settings.chunkSize);
  }

  if (settings.fontSize) {
   await page.getByRole('combobox').selectOption(settings.fontSize);
  }

  await page.getByRole('button', { name: 'Save' }).click();
 });
}

/**
 * Helper function to open global settings
 * @param page - The Playwright page object
 */
async function openGlobalSettings(page: Page): Promise<void> {
 return await test.step('Open global settings', async () => {
  await page.getByRole('button', { name: '☰' }).click();
  await page.getByRole('button', { name: 'Settings Settings' }).click();
 });
}

/**
 * Helper function to navigate to a specific settings section
 * @param page - The Playwright page object
 * @param section - The settings section to navigate to
 */
async function navigateToSettingsSection(page: Page, section: 'General' | 'Notifications' | 'Appearance'): Promise<void> {
 return await test.step(`Navigate to settings section: ${section}`, async () => {
  await page.getByRole('button', { name: `${section} ${section}` }).click();
 });
}

/**
 * Helper function to close the current modal
 * @param page - The Playwright page object
 */
async function closeModal(page: Page): Promise<void> {
 return await test.step('Close modal', async () => {
  await page.getByTestId('Modal-close').click();
 });
}

/**
 * Helper function to set up an account through the initial wizard
 * @param page - The Playwright page object
 * @param accountData - Object containing account information
 */
async function setupAccountInWizard(page: Page, accountData: { server: string; address: string; password: string; title?: string }): Promise<void> {
 return await test.step(`Setup account in wizard: ${accountData.address}`, async () => {
  await page.getByTestId('wizard-next').click();
  await page.getByRole('textbox', { name: 'Title:' }).click();
  await page.getByRole('textbox', { name: 'Title:' }).fill(accountData.title || '');
  await page.getByRole('textbox', { name: 'Server:' }).press('Shift+Home');
  await page.getByRole('textbox', { name: 'Server:' }).fill(accountData.server);
  await page.getByRole('textbox', { name: 'Address:' }).fill(accountData.address);
  await page.getByRole('textbox', { name: 'Password:' }).fill(accountData.password);
  await page.getByRole('button', { name: 'Add the account' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
 });
}

/**
 * Helper function to export accounts
 * @param page - The Playwright page object
 * @returns The download object
 */
async function exportAccounts(page: Page): Promise<any> {
 return await test.step('Export accounts', async () => {
  await page.getByRole('button', { name: 'Export' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Download').click();
  const download = await downloadPromise;
  // Close dialog
  await page.getByRole('button', { name: 'X', exact: true }).click();
  return download;
 });
}

/**
 * Helper function to delete the first account in the list
 * @param page - The Playwright page object
 */
async function deleteFirstAccount(page: Page): Promise<void> {
 return await test.step('Delete first account', async () => {
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.locator('button').filter({ hasText: 'Delete' }).click();
 });
}

/**
 * Helper function to toggle the enabled state of the first account
 * @param page - The Playwright page object
 */
async function toggleFirstAccountEnabled(page: Page): Promise<void> {
 return await test.step('Toggle first account enabled state', async () => {
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.locator('label').filter({ hasText: 'Enabled:' }).locator('span').click();
  await page.getByRole('button', { name: 'Save' }).click();
 });
}

test('Complete End-to-End Application Test', async ({ page }) => {
 await page.goto('http://localhost:3000/');

 await test.step('Initial Account Setup', async () => {
  // Add account in the wizard
  await setupAccountInWizard(page, {
   server: 'ws://localhost:8085',
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
   server: 'ws://localhost:8085/',
   address: 'user2@example.com',
   password: 'password',
  });
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
  // Switch account
  await switchAccount(page, 'user2@example.com');

  // Open conversation
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

 await test.step('Additional Conversation', async () => {
  // Switch account
  await switchAccount(page, 'user1@example.com');

  // Switch module
  await switchModule(page, 'org.libersoft.messages');

  // Start a new conversation with user3
  await startNewConversation(page, 'user3@example.com');

  // Send a message
  await sendMessage(page, 'hi 3');

  // Open messages settings
  await configureMessagesSettings(page, {
   chunkSize: '636928',
   fontSize: '10px',
  });
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
   server: 'ws://localhost:8085',
   address: 'user3@example.com',
   password: 'password',
  });

  // Export all accounts
  const download1 = await exportAccounts(page);

  // Delete account
  await deleteFirstAccount(page);

  // Disable account
  await toggleFirstAccountEnabled(page);
 });

 await test.step('Final Account Settings', async () => {
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
  // Open global settings
  await openGlobalSettings(page);

  // Navigate to notifications settings
  await navigateToSettingsSection(page, 'Notifications');
  await page.getByRole('row', { name: 'Notification sound:' }).locator('span').click();

  // Navigate to appearance settings
  await navigateToSettingsSection(page, 'Appearance');

  // Back to notifications
  await navigateToSettingsSection(page, 'Notifications');

  // Close settings
  await closeModal(page);
 });
});
