import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: 'jsdom',
			include: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
			exclude: ['**/e2e/**'],
			setupFiles: ['./vitest.shims.js'],
			globals: true,
		},
	})
);
