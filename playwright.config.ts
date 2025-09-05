import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
	globalTimeout: 1_000_000,
	timeout: 620_000,
	expect: {
		//timeout: 20_000,
	},
	testDir: './src/',
	testMatch: ['**/e2e/**/*.test.ts'],
	//testIgnore: ['**/wallet-send-dialog-from-sw-to-trezor.test.ts', '**/wallet-send-dialog-from-trezor-to-sw.test.ts', '**/wallet-send-dialog-from-ledger-to-sw.test.ts'],

	use: {
		ignoreHTTPSErrors: true,
		viewport: { width: 1280, height: 128 },
	},
	reporter: [['github'], ['list'], ['json', { outputFile: 'test-results/playwright-report.json' }]],
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1000, height: 800 },
				launchOptions: {
					args: ['--disable-web-security', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
				},
			},
		},
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				viewport: { width: 1000, height: 800 },
				launchOptions: {
					firefoxUserPrefs: {
						'media.navigator.streams.fake': true,
						'media.navigator.permission.disabled': true,
					},
				},
			},
		},
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 13'],
				launchOptions: {},
			},
		},
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5'],
				launchOptions: {
					args: ['--disable-web-security', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
				},
			},
		},
	],
});
