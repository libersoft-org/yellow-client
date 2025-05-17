import { test, expect } from '@playwright/test';

/**
 * Helper function to switch to a module only if it's not already selected
 * @param page - The Playwright page object
 * @param moduleId - The module ID to switch to
 */
async function switchModule(page, moduleId) {
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
}

test('test', async ({ page }) => {
 await page.goto('http://localhost:3000/');

 // add account in the wizard
 await page.getByTestId('wizard-next').click();
 await page.getByRole('textbox', { name: 'Title:' }).click();
 await page.getByRole('textbox', { name: 'Title:' }).fill('');
 await page.getByRole('textbox', { name: 'Server:' }).press('Shift+Home');
 await page.getByRole('textbox', { name: 'Server:' }).fill('ws://localhost:8085');
 await page.getByRole('textbox', { name: 'Address:' }).fill('user1@example.com');
 await page.getByRole('textbox', { name: 'Password:' }).fill('password');
 await page.getByRole('button', { name: 'Add the account' }).click();
 await page.getByRole('button', { name: 'Next' }).click();
 await page.getByRole('button', { name: 'Next' }).click();
 await page.getByRole('button', { name: 'Finish' }).click();


 // switch to account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user1@example.com').click();

 // switch to account management
 await page.getByTestId('account-bar-toggle').click();
 await page.getByRole('button', { name: 'Account management Account' }).click();

 // add new account
 await page.getByRole('button', { name: 'Add a new account Add a new' }).click();
 await page.getByRole('textbox', { name: 'Title:' }).dblclick();
 await page.getByRole('textbox', { name: 'Title:' }).press('End');
 await page.getByRole('textbox', { name: 'Title:' }).press('Shift+Home');
 await page.getByRole('textbox', { name: 'Title:' }).fill('');
 await page.getByRole('textbox', { name: 'Password:' }).click();
 await page.getByRole('textbox', { name: 'Password:' }).fill('password');
 await page.getByRole('textbox', { name: 'Address:' }).click();
 await page.getByRole('textbox', { name: 'Server:' }).click();
 await page.getByRole('textbox', { name: 'Server:' }).press('End');
 await page.getByRole('textbox', { name: 'Server:' }).press('Shift+Home');
 await page.getByRole('textbox', { name: 'Server:' }).fill('ws://localhost:8085/');
 await page.getByRole('textbox', { name: 'Address:' }).click();
 await page.getByRole('textbox', { name: 'Address:' }).fill('user2@example.com');
 await page.getByTestId('save').click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user1@example.com').click();

 // switch module
 await switchModule(page, 'org.libersoft.messages');

 // Start a new conversation
 await page.getByTestId('new-conversation-button').click();
 await page.getByTestId('new-conversation-address').fill('user2@example.com');
 await page.getByTestId('New Conversation Open').click();

 // Send a message
 await page.getByTestId('message-input').fill('blabla bla');
 await page.getByTestId('messagebarsend').click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user2@example.com').click();

 // open conversation
 await page.getByTestId('conversation user1@example.com').click();

 // Reply to a message
 // - right-click the last message, then click Reply
 // This could use two improvements:
 // last() gets the last message, which might not be the exact message we sent above, especially if we want to consider running the tests without always clearing and re-populating the database, which we dont want to do always (like during test development).
 await page.getByTestId('message-item').last().click({ button: 'right' });
 // the other improvement is that we should test that what we click that particular message, (say we identify it by its uuid), we should check that it is the corresponding context menu that becomes visible. But we should probably mainly rewrite ContextMenu to make it only render when it's open, rather than rendering in invisible state. If i'm not mistaken, the test here could be clicking on an invisible item.
 await page.getByTestId('reply-context-menu-item').last().click();
 await page.getByTestId('message-input').fill('ble ble ble');
 await page.getByTestId('messagebarsend').click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user1@example.com').click();

 // open conversation
 await page.getByTestId('conversation user2@example.com').click();

 // send reaction
 await page.getByTestId('message-reaction-menu-button').last().click();
 await page.getByTestId('message-reaction-emoji-button').last().click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user1@example.com').click();

 // switch module
 await switchModule(page, 'org.libersoft.messages');

 // Start a new conversation with user3
 await page.getByTestId('new-conversation-button').click();
 await page.getByTestId('new-conversation-address').fill('user3@example.com');
 await page.getByTestId('New Conversation Open').click();

 // Send a message
 await page.getByTestId('message-input').fill('hi 3');

 // Open messages settings
 await page.getByTestId('messages-settings-button').click();
 await page.getByRole('slider').fill('636928');
 await page.getByRole('combobox').selectOption('10px');
 await page.getByRole('button', { name: 'Save' }).click();

 // Switch between modules
 await switchModule(page, 'org.libersoft.contacts');
 await switchModule(page, 'org.libersoft.dating');
 await switchModule(page, 'org.libersoft.wallet');
 await switchModule(page, 'org.libersoft.iframes');
 await switchModule(page, 'org.libersoft.contacts');
 await switchModule(page, 'org.libersoft.messages');

 // Go to account management
 await page.getByTestId('account-bar-toggle').click();
 await page.getByRole('button', { name: 'Account management Account' }).click();

 // Add a new account with user3
 await page.getByRole('button', { name: 'Add a new account Add a new' }).click();
 // Clear and fill account fields
 await page.getByRole('textbox', { name: 'Title:' }).fill('');
 await page.getByRole('textbox', { name: 'Server:' }).fill('ws://localhost:8085');
 await page.getByRole('textbox', { name: 'Address:' }).fill('user3@example.com');
 await page.getByRole('textbox', { name: 'Password:' }).fill('password');
 await page.getByTestId('save').click();

 // Export all accounts
 await page.getByRole('button', { name: 'Export' }).click();
 const download1Promise = page.waitForEvent('download');
 await page.getByText('Download').click();
 const download1 = await download1Promise;
 // close dialog
 await page.getByRole('button', { name: 'X', exact: true }).click();

 // Delete account
 await page.getByRole('button', { name: 'Delete' }).first().click();
 await page.locator('button').filter({ hasText: 'Delete' }).click();

 // Disable account
 await page.getByRole('button', { name: 'Edit' }).first().click();
 // Toggle the enabled checkbox
 await page.locator('label').filter({ hasText: 'Enabled:' }).locator('span').click();
 await page.getByRole('button', { name: 'Save' }).click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user3@example.com').click();
 await new Promise(resolve => setTimeout(resolve, 5000));

 await switchModule(page, 'org.libersoft.messages');

 // Open messages settings
 await page.getByTestId('messages-settings-button').click();
 // Change chunk size
 await page.getByRole('slider').fill('2756608');
 await page.getByRole('button', { name: 'Save' }).click();

 // Open global settings
 await page.getByRole('button', { name: '☰' }).click();
 await page.getByRole('button', { name: 'Settings Settings' }).click();

 // Navigate to notifications settings
 await page.getByRole('button', { name: 'Notifications Notifications' }).click();
 await page.getByRole('row', { name: 'Notification sound:' }).locator('span').click();

 // Navigate to appearance settings
 await page.getByRole('button', { name: 'Appearance Appearance' }).click();

 // Back to notifications
 await page.getByRole('button', { name: 'Notifications Notifications' }).click();

 // close settings
 await page.getByTestId('Modal-close').click();
});
