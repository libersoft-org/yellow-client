import adapter from '@sveltejs/adapter-static';

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
   fallback: 'index.html'
  })
 }
};

export default config;
