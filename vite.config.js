import pluginChecker from 'vite-plugin-checker';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';
import 'dotenv/config';
import dotenv from 'dotenv';

export function getGitCommitHash() {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch (e) {
		return null;
	}
}

export function getGitBranch() {
	try {
		return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
	} catch (e) {
		return null;
	}
}

export default defineConfig(({ mode }) => {
	// Load environment variables from .env.local if it exists
	dotenv.config({ path: '.env.local' });

	// Check if Sentry is enabled
	const sentryEnabled = /^(true|1|yes|on)$/i.test((process.env.VITE_SENTRY_ENABLED || '').trim());

	return {
		resolve: {
			...(process.env.VITEST ? { conditions: ['browser'] } : {}),
			alias: {
				'@/bridge/core-bridge': process.env.TAURI_SERVICE === 'true' ? path.resolve(__dirname, 'src/modules/org.libersoft.messages/scripts/core-bridge-mobile.ts') : path.resolve(__dirname, 'src/modules/org.libersoft.messages/scripts/core-bridge-builtin.ts'),
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					quietDeps: true,
					quiet: true,
				},
			},
		},
		plugins: [
			...(sentryEnabled
				? [
						sentrySvelteKit({
							sourceMapsUploadOptions: {
								org: 'yyy-2c',
								project: 'yellow',
							},
							telemetry: false,
						}),
					]
				: []),
			devtoolsJson(),
			sveltekit(),
			...(process.env.VITEST
				? []
				: [
						svelteInspector({
							toggleKeyCombo: 'control-shift',
							holdMode: true,
							showToggleButton: 'active',
							toggleButtonPos: 'top-right',
						}),
					]),
			...(mode === 'development' ? [pluginChecker({ typescript: true })] : []),
		],
		define: {
			__BUILD_DATE__: new Date(),
			__COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
			__BRANCH__: JSON.stringify(getGitBranch()),
		},
		server: {
			https: fs.existsSync(path.resolve(__dirname, 'server.key'))
				? {
						key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
						cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
					}
				: fs.existsSync(path.resolve(__dirname, 'certs/server.key'))
					? {
							key: fs.readFileSync(path.resolve(__dirname, 'certs/server.key')),
							cert: fs.readFileSync(path.resolve(__dirname, 'certs/server.crt')),
						}
					: null,
			allowedHosts: true,
			host: true,
			port: 3000,
		},
		build: {
			chunkSizeWarningLimit: 6000,
			minify: process.env.VITE_BUILD_MINIFY !== 'false',
		},
		optimizeDeps: {
			include: ['@tauri-apps/api'],
		},
	};
});
