import pluginChecker from 'vite-plugin-checker';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
 plugins: [sveltekit(),
  pluginChecker({ typescript: true }),
 ],
 server: {
  https: (fs.existsSync(path.resolve(__dirname, 'server.key')) ?
   {
    key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
   } : null),
  host: true,
  port: 3000
 }
});
