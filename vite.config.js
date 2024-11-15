import pluginChecker from 'vite-plugin-checker';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import conditionalImportPlugin from "vite-plugin-conditional-import";
import fs from 'fs';
import path from 'path';

const IS_DEBUG = false;

export default defineConfig(({mode}) => {
  return {
   plugins: [
    sveltekit(),
    pluginChecker({typescript: true}),
    conditionalImportPlugin({
     currentEnv: IS_DEBUG ? "DEBUG" : "NODEBUG",
     envs: ["DEBUG", "NODEBUG"],
    }),
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
