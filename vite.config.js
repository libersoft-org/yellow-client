import pluginChecker from 'vite-plugin-checker';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function getGitCommitHash() {
 try {
  return execSync('cd .git && git rev-parse --short HEAD').toString().trim();
 } catch (e) {
  return null;
 }
}

export default defineConfig(({mode}) => {
  return {
   resolve: process.env.VITEST
    ? {conditions: ['browser']} : undefined,
   css: {
    preprocessorOptions: {
     scss: {
      quietDeps: true,
      quiet: true,
     }
    }
   },
   plugins: [
    sveltekit(),
    ...(mode === 'development' ? [pluginChecker({typescript: true})] : []),
   ],
   define: {
    __BUILD_DATE__: new Date(),
    __COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
   },
   server: {
    https: (fs.existsSync(path.resolve(__dirname, 'server.key')) ?
     {
      key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
     } : null),
    allowedHosts: true,
    host: true,
    port: 3000
   },
   build: {
    chunkSizeWarningLimit: 6000
   }
  }
 }
);
