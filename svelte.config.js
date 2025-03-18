import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
 kit: {
  paths: {
   base: process.env.NODE_ENV === 'production' ? '/client' : '',
   relative: false
  },
  adapter: adapter({
   pages: 'build',
   assets: 'build',
   fallback: 'index.html'
  }),
  alias: {
   "@/org.libersoft.messages/*": "src/modules/org.libersoft.messages/*",
   "@/*": "src/*",
  }
 }
};

export default config;
