import type { StorybookConfig } from '@storybook/sveltekit';
import path from 'path';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
	/* Storybook 9 dissolved addon-essentials and addon-viewport into the core package, so they are no
	 * longer listed here - keeping the v8 packages around made the test project fail to build. */
	addons: ['@storybook/addon-svelte-csf', '@chromatic-com/storybook', '@storybook/addon-vitest'],
	framework: {
		name: '@storybook/sveltekit',
		options: {},
	},
	staticDirs: ['../static'],
	viteFinal: async config => {
		if (config.resolve) {
			config.resolve.alias = {
				...config.resolve.alias,
				'@/bridge/core-bridge': process.env.TAURI_SERVICE === 'true' ? path.resolve(__dirname, '../src/modules/org.libersoft.messages/core-bridge-mobile.ts') : path.resolve(__dirname, '../src/modules/org.libersoft.messages/core-bridge-builtin.ts'),
			};
		}
		return config;
	},
};
export default config;
