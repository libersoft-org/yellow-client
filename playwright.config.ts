import { defineConfig } from '@playwright/test';

export default defineConfig({
   testDir: './src/',
   testMatch: ['**/e2e/**/*.test.ts'],
   reporter: [
     ['github'],
     ['list'],
     ['json', { outputFile: 'test-results/playwright-report.json' }]
   ],
});
