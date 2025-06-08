import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
	testDir: './src/',
	testMatch: ['**/e2e/**/*.test.ts'],

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
				viewport: { width: 1280, height: 1280 },
			},
		},
		/*{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 13'],
			},
		},*/
	],
});
