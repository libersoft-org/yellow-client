import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
		exclude: ['**/e2e/**', '**/stories/**', '**/*.stories.*', '.storybook/**', 'src/routes/**', 'node_modules/**', 'dist/**', 'build/**', '.svelte-kit/**'],
		setupFiles: ['./vitest.shims.js'],
		globals: true,
		server: {
			deps: {
				// Tell Vitest to handle this problematic package differently
				inline: ['svelte-intersection-observer'],
			},
		},
	},
	resolve: {
		conditions: ['browser'],
		alias: {
			'@/org.libersoft.messages': path.resolve(__dirname, './src/modules/org.libersoft.messages'),
			'@/org.libersoft.contacts': path.resolve(__dirname, './src/modules/org.libersoft.contacts'),
			'@/org.libersoft.wallet': path.resolve(__dirname, './src/modules/org.libersoft.wallet'),
			'@/org.libersoft.dating': path.resolve(__dirname, './src/modules/org.libersoft.dating'),
			'@/org.libersoft.iframe': path.resolve(__dirname, './src/modules/org.libersoft.iframe'),
			'@/bridge/core-bridge': path.resolve(__dirname, './src/modules/org.libersoft.messages/scripts/core-bridge-builtin.ts'),
			'@': path.resolve(__dirname, 'src'),
			// Add explicit resolution for the problematic package
			'svelte-intersection-observer': path.resolve(__dirname, './node_modules/svelte-intersection-observer/src/index.js'),
			// Map lodash-es to regular lodash for better compatibility
			'lodash-es': 'lodash',
		},
	},
	define: {
		__BUILD_DATE__: null,
		__COMMIT_HASH__: JSON.stringify('test-commit-hash'),
		__BRANCH__: JSON.stringify('test-branch'),
	},
	// Prevent Vite from scanning non-test files
	optimizeDeps: {
		entries: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
		exclude: ['svelte-intersection-observer'],
	},
});
