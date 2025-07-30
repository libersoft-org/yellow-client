import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

const base = process.env.NODE_ENV === 'production' ? (process.env.TAURI ? '' : process.env.VITE_CLIENT_PATH_BASE === undefined ? '' : process.env.VITE_CLIENT_PATH_BASE) : '';
/*console.log('process.env.VITE_CLIENT_PATH_BASE:', process.env.VITE_CLIENT_PATH_BASE);
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('process.env.TAURI:', process.env.TAURI);
console.log('Base path:', base);*/

/** @type {import('@sveltejs/kit').Config} */
const config = {
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'alt-x',
		},
	},
	kit: {
		paths: {
			base,
			relative: false,
		},
		adapter: adapter({
			pages: process.env.TAURI ? 'build-tauri' : 'build',
			assets: process.env.TAURI ? 'build-tauri' : 'build',
			fallback: process.env.TAURI ? 'src/404.html' : 'index.html',
		}),
		alias: {
			'@/org.libersoft.messages/*': 'src/modules/org.libersoft.messages/*',
			'@/org.libersoft.contacts/*': 'src/modules/org.libersoft.contacts/*',
			'@/org.libersoft.wallet/*': 'src/modules/org.libersoft.wallet/*',
			'@/org.libersoft.dating/*': 'src/modules/org.libersoft.dating/*',
			'@/org.libersoft.iframes/*': 'src/modules/org.libersoft.iframes/*',
			'@/bridge/core-bridge': process.env.TAURI_SERVICE === 'true' ? path.resolve('src/modules/org.libersoft.messages/scripts/core-bridge-mobile.ts') : path.resolve('src/modules/org.libersoft.messages/scripts/core-bridge-builtin.ts'),
			'@/*': 'src/*',
		},
	},
	preprocess: vitePreprocess({ script: true }),
};

export default config;
