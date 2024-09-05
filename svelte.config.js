import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
 kit: {
  paths: {
   base: '/client',
   //assets: '/client/assets-custom',
   relative: false
  },
  adapter: adapter({
   pages: 'build',
   assets: 'build',
   fallback: 'index.html'
  })
 }
};

export default config;
