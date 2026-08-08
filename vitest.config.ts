import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';

/* Vitest 4 no longer reads vitest.workspace.ts - projects live here. `npm run test:unit` and
 * `npm run test:storybook` (which is what CI runs) select these by name, so a missing project means
 * CI silently runs nothing at all. */

const alias = {
	'@/org.libersoft.messages': path.resolve(__dirname, './src/modules/org.libersoft.messages'),
	'@/org.libersoft.contacts': path.resolve(__dirname, './src/modules/org.libersoft.contacts'),
	'@/org.libersoft.wallet': path.resolve(__dirname, './src/modules/org.libersoft.wallet'),
	'@/org.libersoft.dating': path.resolve(__dirname, './src/modules/org.libersoft.dating'),
	'@/org.libersoft.iframes': path.resolve(__dirname, './src/modules/org.libersoft.iframes'),
	'@/bridge/core-bridge': path.resolve(__dirname, './src/modules/org.libersoft.messages/scripts/core-bridge-builtin.ts'),
	'@': path.resolve(__dirname, 'src'),
	// Add explicit resolution for the problematic package
	'svelte-intersection-observer': path.resolve(__dirname, './node_modules/svelte-intersection-observer/src/index.js'),
	// Map lodash-es to regular lodash for better compatibility
	'lodash-es': 'lodash',
};

const define = {
	__BUILD_DATE__: null,
	__COMMIT_HASH__: JSON.stringify('test-commit-hash'),
	__BRANCH__: JSON.stringify('test-branch'),
};

export default defineConfig({
	test: {
		projects: [
			{
				/* Needed so unit tests can render .svelte components (e.g. the message renderer). */
				plugins: [svelte()],
				test: {
					name: 'unit',
					environment: 'jsdom',
					include: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
					exclude: ['**/e2e/**', '**/stories/**', '**/*.stories.*', '.storybook/**', 'src/routes/**', 'node_modules/**', 'dist/**', 'build/**', '.svelte-kit/**'],
					setupFiles: ['./vitest.shims.js'],
					globals: true,
					server: {
						deps: {
							// Tell Vitest to handle this problematic package differently.
							// @ledgerhq/* ships extensionless ESM imports, which Node cannot resolve on its own -
							// they have to go through Vite's resolver, which matters when libersoft-crypto is
							// linked from a local checkout rather than installed from git.
							inline: ['svelte-intersection-observer', 'ethers', /@ledgerhq/, 'libersoft-crypto'],
						},
					},
				},
				resolve: {
					conditions: ['browser'],
					alias,
				},
				define,
				// Prevent Vite from scanning non-test files
				optimizeDeps: {
					entries: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
					exclude: ['svelte-intersection-observer'],
				},
			},
			{
				plugins: [
					svelte(),
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
					storybookTest({ configDir: path.join(__dirname, '.storybook') }),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						/* Vitest 4 takes a provider factory, not a name. */
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
					},
					setupFiles: ['.storybook/vitest.setup.ts'],
				},
				resolve: { alias },
				define,
			},
		],
	},
});
