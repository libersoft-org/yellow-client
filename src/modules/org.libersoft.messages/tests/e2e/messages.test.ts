import { test, expect } from '@playwright/test';

const accountsConfig = [
 {
  id: '0',
  enabled: true,
  credentials: {
   address: 'user1@example.com',
   server: 'ws://localhost:8085/',
   password: 'password',
  },
  settings: {
   title: '',
   last_module_id: 'org.libersoft.messages',
  },
 },
];

const activeAccountId = '0';

test.beforeEach(async ({ page }) => {
 await page.goto('http://localhost:3000'); // Avoid possible race conditions
 await page.evaluate(
  async ({ accountsConfig, activeAccountId }) => {
   console.log('accountsConfig', accountsConfig);
   localStorage.setItem('accounts_config', JSON.stringify(accountsConfig));
   localStorage.setItem('active_account_id', JSON.stringify(activeAccountId));
   await new Promise(resolve => setTimeout(resolve, 1000));
  },
  { accountsConfig, activeAccountId }
 );
});

test('Test with manually set localStorage', async ({ page }) => {
 await page.goto('http://localhost:3000');

 // Verify localStorage
 const active_account_id = await page.evaluate(() => JSON.parse(localStorage.getItem('active_account_id') || ''));
 expect(active_account_id).toBe(activeAccountId);

 await page.getByRole('button', { name: 'user2@example.com' }).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).fill('hi from playwright');
 await page.getByRole('button', { name: 'Send' }).click();
 await expect(page.waitForSelector('text=hi from playwright')).toBeTruthy();
});

test('Test with account import', async ({ page }) => {
 await page.goto('http://localhost:3000/');
 await page.getByRole('button', { name: 'CREATE ACCOUNT FIRST ▼' }).click();
 await page.getByRole('button', { name: 'Account management Account management', exact: true }).click();
 await page.getByRole('button', { name: 'X', exact: true }).click();
 await page.getByRole('button', { name: 'Import' }).click();
 await page.getByRole('textbox').fill('[\n  {\n    "id": "0",\n    "enabled": true,\n    "credentials": {\n      "address": "user1@example.com",\n      "server": "ws://localhost:8085/",\n      "password": "password",\n      "retry_nonce": 0\n    },\n    "settings": {\n      "title": "",\n      "last_module_id": "org.libersoft.messages"\n    }\n  }\n]');
 await page.locator('.body > .base-button').click();
 await page.getByRole('button', { name: 'X', exact: true }).click();
 await page.locator('.item > .base-button').first().click();
 await page.getByRole('button', { name: 'SELECT YOUR ACCOUNT ▼' }).click();
 await page.getByRole('button', { name: 'user1@example.com Logged in.', exact: true }).click();
 await page.locator('div').filter({ hasText: 'Select your conversationor Start a new one' }).nth(3).click();
 await page.locator('.item > .base-button').first().click();
 await page.locator('.item > .base-button').first().click();
 await page.getByRole('button', { name: 'New conversation New' }).click();
 await page.getByRole('textbox', { name: 'user@domain.tld' }).fill('user2@example.com');
 await page.getByRole('button', { name: 'Open' }).click();
 await page
  .locator('div')
  .filter({ hasText: /^Send a message to start a conversation$/ })
  .first()
  .click();
 await page.getByRole('textbox', { name: 'Enter your message' }).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).fill('ararararara');
 await expect(page.waitForSelector('text=ararararara')).toBeTruthy();
});
