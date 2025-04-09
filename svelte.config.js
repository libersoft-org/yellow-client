import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
 kit: {
  paths: {
   base: process.env.NODE_ENV === 'production' ? (process.env.TAURI ? '' : '/client') : '',
   relative: false
  },
  adapter: adapter({
   pages: process.env.TAURI ? 'build-tauri' : 'build',
   assets: process.env.TAURI ? 'build-tauri' : 'build',
   fallback: process.env.TAURI ? 'src/404.html' : 'index.html',
  }),
  alias: {
   "@/*": "src/*",
  }
 },
 preprocess: vitePreprocess({ script: true })
};

export default config;
