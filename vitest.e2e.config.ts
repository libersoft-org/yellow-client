import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
 test: {
  include: ['**/e2e/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude: ['**/*.test.ts', '**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
  environment: 'jsdom',
  globals: true,
  testTimeout: 60000,
 },
 resolve: {
  conditions: ['browser'],
  alias: {
   '@': path.resolve(__dirname, './src'),
  },
 },
 define: {
  __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  __COMMIT_HASH__: JSON.stringify('test-commit-hash'),
 },
});
