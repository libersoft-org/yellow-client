import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

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
   "@/org.libersoft.dating/*": "src/modules/org.libersoft.dating/*",
   "@/*": "src/*",
  }
 },
 preprocess: vitePreprocess({ script: true })
};

export default config;
