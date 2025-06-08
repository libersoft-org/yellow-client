import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'alt-s',
		},
	},
	kit: {
		paths: {
			base: process.env.NODE_ENV === 'production' ? (process.env.TAURI ? '' : process.env.CLIENT_PATH_BASE === undefined ? '' : process.env.CLIENT_PATH_BASE) : '',
			relative: false,
		},
		adapter: adapter({
			pages: process.env.TAURI ? 'build-tauri' : 'build',
			assets: process.env.TAURI ? 'build-tauri' : 'build',
			fallback: process.env.TAURI ? 'src/404.html' : 'index.html',
		}),
		alias: {
			'@/org.libersoft.messages/*': 'src/modules/org.libersoft.messages/*',
			'@/org.libersoft.dating/*': 'src/modules/org.libersoft.dating/*',
			'@/bridge/core-bridge': process.env.TAURI_SERVICE === 'true' ? path.resolve('src/modules/org.libersoft.messages/core-bridge-mobile.ts') : path.resolve('src/modules/org.libersoft.messages/core-bridge-builtin.ts'),
			'@/*': 'src/*',
		},
	},
	preprocess: vitePreprocess({ script: true }),
};

export default config;
