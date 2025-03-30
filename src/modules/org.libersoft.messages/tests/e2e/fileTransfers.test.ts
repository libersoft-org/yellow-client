import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { Download } from 'playwright-core';

const accountsConfig1 = [
 {
  id: '0.nevi7i5dl6l0.fktc53bphkf0.asgvqm0qf0m0.njtdkwkktbd',
  enabled: true,
  credentials: {
   address: 'super@tvorbawebu.eu',
   server: 'ws://localhost:8085/',
   password: 'qwertz11AA',
  },
  settings: {
   title: 'My accountdfsaf',
   last_module_id: 'org.libersoft.messages',
  },
 },
];

const accountsConfig2 = [
 {
  id: '0.vivi7i5dl6l0.fktc53bphkf0.asgvqm0qf0m0.njtdkwkktbd',
  enabled: true,
  credentials: {
   address: 'test@tvorbawebu.eu',
   server: 'ws://localhost:8085/',
   password: 'qwertz11AA',
  },
  settings: {
   title: 'My accountdfsaf',
   last_module_id: 'org.libersoft.messages',
  },
 },
];

const logInAccount = async (page: Page, accountsConfig: object, activeAccountId: string) => {
 await page.goto('http://localhost:3000'); // Avoid possible race conditions
 await page.evaluate(
  ({ accountsConfig, activeAccountId }) => {
   localStorage.setItem('accounts_config', JSON.stringify(accountsConfig));
   localStorage.setItem('active_account_id', activeAccountId);
  },
  { accountsConfig, activeAccountId }
 );
 await page.reload();
};

// test.beforeEach(async ({ page }) => {
//  await page.goto('http://localhost:3000'); // Avoid possible race conditions
//  await page.evaluate(({ accountsConfig, activeAccountId }) => {
//   console.log('accountsConfig', accountsConfig);
//   localStorage.setItem('accounts_config', JSON.stringify(accountsConfig));
//   localStorage.setItem('active_account_id', activeAccountId);
//  }, { accountsConfig, activeAccountId });
// });

const prepareFile = () => ({
 name: uuidv4() + '.pdf',
 mimeType: 'application/pdf',
 buffer: fs.readFileSync('src/modules/org.libersoft.messages/tests/_files/sample.pdf'),
});

const assertDownload = async (download: Download, originalFile: ReturnType<typeof prepareFile>) => {
 const filePath = await download.path();
 await download.saveAs('downloads/' + originalFile.name);

 // (Receiver) Verify the file name
 expect(download.suggestedFilename()).toBe(originalFile.name);
 // (Receiver) Verify the file size
 expect(fs.statSync(filePath).size).toBe(originalFile.buffer.length);
 // (Receiver) Verify the file content
 expect(fs.readFileSync(filePath)).toEqual(originalFile.buffer);
};

test('Test basic file upload & download', async ({ page }) => {
 const activeAccountId = '"' + accountsConfig1[0].id + '"';
 await logInAccount(page, accountsConfig1, activeAccountId);
 await page.goto('http://localhost:3000');

 // Verify localStorage
 const active_account_id = await page.evaluate(() => localStorage.getItem('active_account_id'));
 expect(active_account_id).toBe(activeAccountId);

 await page.getByRole('button', { name: 'test@tvorbawebu.eu' }).click();

 /**
  * Test file upload
  */
 await page.getByTestId('attachment-button').click();
 await page.getByTestId('file-attachment-button').click();

 const originalFile = prepareFile();
 await page.getByTestId('file-upload-input').setInputFiles([originalFile]);

 await page.getByTestId('send-files-server').click();
 await expect(page.getByTestId(originalFile.name)).toBeVisible();

 await expect(page.getByTestId(originalFile.name).getByTestId('download-button')).toBeVisible({
  timeout: 10000,
 });

 /**
  * Test file download
  */
 const downloadPromise = page.waitForEvent('download');
 await page.getByTestId(originalFile.name).getByTestId('download-button').click();
 const download = await downloadPromise;
 await assertDownload(download, originalFile);
});

test('Test p2p file transfer', async ({ browser }) => {
 // Create two separate browser contexts (isolated sessions)
 const senderContext = await browser.newContext();
 const receiverContext = await browser.newContext();

 // Open pages for sender and receiver
 const senderPage = await senderContext.newPage();
 const receiverPage = await receiverContext.newPage();

 // Log in both users
 const senderActiveAccountId = '"' + accountsConfig1[0].id + '"';
 const receiverActiveAccountId = '"' + accountsConfig2[0].id + '"';
 await logInAccount(senderPage, accountsConfig1, senderActiveAccountId);
 await logInAccount(receiverPage, accountsConfig2, receiverActiveAccountId);

 // Navigate both users to the P2P transfer page
 await senderPage.goto('http://localhost:3000');
 await receiverPage.goto('http://localhost:3000');

 // Verify localStorage data
 expect(await senderPage.evaluate(() => localStorage.getItem('active_account_id'))).toBe(senderActiveAccountId);
 expect(await receiverPage.evaluate(() => localStorage.getItem('active_account_id'))).toBe(receiverActiveAccountId);

 // (Sender) Open conversation
 await senderPage.getByRole('button', { name: 'test@tvorbawebu.eu' }).click();

 // (Sender) Open file upload modal
 await senderPage.getByTestId('attachment-button').click();
 await senderPage.getByTestId('file-attachment-button').click();

 // (Sender) Prepare & Upload file
 const originalFile = prepareFile();
 await senderPage.getByTestId('file-upload-input').setInputFiles([originalFile]);

 // (Sender) Send file via p2p button
 await senderPage.getByTestId('send-files-p2p').click();

 // (Sender) Check if message with file box is visible
 await expect(senderPage.getByTestId(originalFile.name)).toBeVisible();

 // (Receiver) Open conversation
 await receiverPage.getByRole('button', { name: 'super@tvorbawebu.eu' }).click();

 // (Receiver) Check if message with file box is visible
 await expect(receiverPage.getByTestId(originalFile.name)).toBeVisible();

 // (Receiver) Click on accept to begin file transfer & verify
 const downloadPromise = receiverPage.waitForEvent('download');
 await receiverPage.getByTestId(originalFile.name).getByTestId('p2p-accept-button').click();
 const download = await downloadPromise;
 await assertDownload(download, originalFile);
});

test('sdfsdfs', async ({ page }) => {
 const activeAccountId = '"' + accountsConfig1[0].id + '"';
 await logInAccount(page, accountsConfig1, activeAccountId);
 await page.goto('http://localhost:3000');

 // Verify localStorage
 const active_account_id = await page.evaluate(() => localStorage.getItem('active_account_id'));
 expect(active_account_id).toBe(activeAccountId);

 await page.getByRole('button', { name: 'test@tvorbawebu.eu' }).click();

 await page.getByRole('button', { name: 'Record voice message' }).first().click();
 await page.getByRole('button', { name: 'Voice message.wav (44.89 KB)' }).click();
});
