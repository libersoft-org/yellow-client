import pluginChecker from 'vite-plugin-checker';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig(({mode}) => {
  return {
   resolve: {
    alias: {
     './yellow_client_debug': mode === 'development' ? 'src/core/client_debug.js' : 'src/core/client_nodebug.js'
    }
   },
   plugins: [
    sveltekit(),
    pluginChecker({typescript: true}),
    {
     name: 'log-alias',
     configResolved(config) {
      console.log('Resolved aliases:', config.resolve.alias);
     }
    }
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
  }
 }
);
