import { test, expect } from '@playwright/test'

const accountsConfig = [
 {
  "id": "0.nevi7i5dl6l0.fktc53bphkf0.asgvqm0qf0m0.njtdkwkktbd",
  "enabled": true,
  "credentials": {
   "address": "super@tvorbawebu.eu",
   "server": "ws://localhost:8085/",
   "password": "qwertz11AA"
  },
  "settings": {
   "title": "My accountdfsaf",
   "last_module_id": "org.libersoft.messages"
  }
 }
]

const activeAccountId = '"0.nevi7i5dl6l0.fktc53bphkf0.asgvqm0qf0m0.njtdkwkktbd"'

test.beforeEach(async ({ page }) => {
 await page.goto('http://localhost:3000'); // Avoid possible race conditions
 await page.evaluate(({ accountsConfig, activeAccountId }) => {
  console.log('accountsConfig', accountsConfig);
  localStorage.setItem('accounts_config', JSON.stringify(accountsConfig));
  localStorage.setItem('active_account_id', activeAccountId);
 }, { accountsConfig, activeAccountId });
});

test('Test with manually set localStorage', async ({ page }) => {
 await page.goto('http://localhost:3000');

 // Verify localStorage
 const active_account_id = await page.evaluate(() => localStorage.getItem('active_account_id'));
 expect(active_account_id).toBe(activeAccountId);

 await page.getByRole('button', {name: "test@tvorbawebu.eu"}).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).click();
 await page.getByRole('textbox', { name: 'Enter your message' }).fill('hi from playwright');
 await page.getByRole('button', { name: 'Send' }).click();
});
