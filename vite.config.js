import pluginChecker from 'vite-plugin-checker';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { sentrySvelteKit } from '@sentry/sveltekit'
import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';

export function getGitCommitHash() {
 try {
  return execSync('sh -c "git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git rev-parse --short HEAD"').toString().trim();
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
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: 'yyy-2c',
        project: 'yellow',
      }
    }),
    sveltekit(),
    svelteInspector({
			toggleKeyCombo: 'control-shift',
			holdMode: true,
			showToggleButton: 'active',
			toggleButtonPos: 'top-right'
		}),
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
   },
   optimizeDeps: {
    include: [
     '@tauri-apps/api',
    ]
   },
  }
 }
);
