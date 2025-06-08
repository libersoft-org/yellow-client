import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
		exclude: ['**/e2e/**'],
		setupFiles: ['./vitest.shims.js'],
		globals: true,
	},
	resolve: {
		conditions: ['browser'],
		alias: {
			'@/org.libersoft.messages': path.resolve(__dirname, 'src/modules/org.libersoft.messages'),
			'@/org.libersoft.dating': path.resolve(__dirname, 'src/modules/org.libersoft.dating'),
			'@': path.resolve(__dirname, 'src'),
			'@/bridge/core-bridge': path.resolve(__dirname, 'src/modules/org.libersoft.messages/core-bridge-builtin.ts'),
		},
	},
	define: {
		__BUILD_DATE__: null,
		__COMMIT_HASH__: JSON.stringify('test-commit-hash'),
		__BRANCH__: JSON.stringify('test-branch'),
	},
});
