import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
 await page.goto('http://localhost:3000/');
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
 await page.getByRole('button', { name: 'user1@example.com ▼' }).click();
 await page.getByRole('button', { name: 'user1@example.com Logged in.' }).click();
 await page.getByRole('button', { name: 'user1@example.com ▼' }).click();
 await page.getByRole('button', { name: 'Account management Account' }).click();
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
 await page.getByRole('button', { name: 'Add the account' }).click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user1@example.com').click();

 // switch module
 await page.getByTestId('ModuleBarItem-org.libersoft.messages').click();

 await page.getByRole('button', { name: 'New conversation New' }).click();
 await page.getByRole('textbox', { name: 'user@domain.tld' }).fill('user2@example.com');
 await new Promise(resolve => setTimeout(resolve, 1000));
 await page.getByTestId('New Conversation Open').click();

 await page.getByRole('textbox', { name: 'Enter your message' }).fill('blabla bla');
 await page.getByTestId('messagebarsend').click();

 // switch account
 await page.getByTestId('account-bar-toggle').click();
 await page.getByTestId('user2@example.com').click();

 await page.getByRole('button', { name: 'blabla bla Add reaction 5/9/' }).click({
  button: 'right',
 });
 await page.getByRole('button', { name: 'Reply Reply' }).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).fill('ble ble ble');

 //  await page.waitForSelector('role=button[name="Open"]');
 //todo: Open not unique
 await page.getByRole('button', { name: 'OpenENEN' }).click();
 await expect(page.getByText('Open')).toBeVisible();
 await page.getByText('Open').click();

 await page.getByRole('textbox', { name: 'Enter your message' }).fill('hi 3');
 await page.getByRole('button', { name: 'user1@example.com user1@' }).click();
 await page.getByRole('button', { name: 'user3@example.com user3@' }).click();
 await page.getByRole('button', { name: 'Messages settings' }).click();
 await page.getByRole('slider').fill('636928');
 await page.getByRole('combobox').selectOption('10px');
 await page.getByRole('button', { name: 'Save' }).click();
 /*  await page.locator('.module-bar').click();
  await page.locator('.module-bar').click();
  await page.locator('.module-bar').click();
  await page.locator('.module-bar').click();*/
 await page.locator('.items > div:nth-child(2) > .base-button').click();
 await page.locator('.items > div:nth-child(3) > .base-button').click();
 await page.locator('div:nth-child(4) > .base-button').first().click();
 await page.locator('div:nth-child(5) > .base-button').first().click();
 await page.locator('.items > div:nth-child(2) > .base-button').click();
 await page.locator('.items > div:nth-child(1) > .base-button').click();
 await page.getByRole('button', { name: 'user2@example.com ▼' }).click();
 await page.getByRole('button', { name: 'Account management Account' }).click();
 const downloadPromise = page.waitForEvent('download');
 await page.getByRole('button', { name: 'Export' }).click();
 const download = await downloadPromise;
 await page.getByRole('button', { name: 'X', exact: true }).click();
 await page.getByRole('button', { name: 'Add a new account Add a new' }).click();
 await page.getByRole('textbox', { name: 'Title:' }).dblclick();
 await page.getByRole('textbox', { name: 'Title:' }).press('End');
 await page.getByRole('textbox', { name: 'Title:' }).press('Shift+Home');
 await page.getByRole('textbox', { name: 'Title:' }).fill('');
 await page.getByRole('textbox', { name: 'Title:' }).press('Tab');
 await page.getByRole('textbox', { name: 'Server:' }).fill('ws://localhost:8085');
 await page.getByRole('textbox', { name: 'Title:' }).click();
 await page.getByRole('textbox', { name: 'Title:' }).press('Tab');
 await page.getByRole('textbox', { name: 'Server:' }).press('Tab');
 await page.getByRole('textbox', { name: 'Address:' }).fill('user3@example.com');
 await page.getByRole('textbox', { name: 'Address:' }).press('Tab');
 await page.getByRole('textbox', { name: 'Password:' }).fill('password');
 await page.getByRole('button', { name: 'Add the account' }).click();
 await page.getByRole('button', { name: 'Export' }).click();
 const download1Promise = page.waitForEvent('download');
 await page.getByText('Export all accounts').click();
 const download1 = await download1Promise;
 await page.getByRole('button', { name: 'Delete' }).first().click();
 await page.locator('button').filter({ hasText: 'Delete' }).click();
 await page.getByRole('button', { name: 'Edit' }).first().click();
 await page.locator('label').filter({ hasText: 'Enabled:' }).locator('span').click();
 await page.getByRole('button', { name: 'Save' }).click();
 //  await page.locator('.s-GZHjBM5MkkEc > .base-button').first().click();
 await page.getByRole('button', { name: 'Start a new one' }).click();
 await page.getByRole('textbox', { name: 'user@domain.tld' }).fill('user1@example.com');
 await page.getByRole('button', { name: 'Open' }).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).fill('hi user1');
 await page.getByRole('button', { name: 'Messages settings' }).click();
 await page.getByRole('slider').fill('2756608');
 await page.getByRole('button', { name: 'Save' }).click();
 await page.getByRole('button', { name: '☰' }).click();
 await page.getByRole('button', { name: 'Settings Settings' }).click();
 await page.getByRole('button', { name: 'Notifications Notifications' }).click();
 await page.getByRole('row', { name: 'Notification sound:' }).locator('span').click();
 await page.getByRole('button', { name: 'Appearance Appearance' }).click();
 await page.getByRole('button', { name: 'Notifications Notifications' }).click();
 await page.getByRole('button', { name: 'X', exact: true }).click();
});
