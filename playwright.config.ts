import { defineConfig } from '@playwright/test';

export default defineConfig({
   testDir: './src/',
   testMatch: ['**/e2e/**/*.test.ts'],
    //viewport: { width: 1280, height: 720 },
    use: {
        ignoreHTTPSErrors: true,
    },
   reporter: [
     ['github'],
     ['list'],
     ['json', { outputFile: 'test-results/playwright-report.json' }]
   ],
});
