import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { sentrySvelteKit } from '@sentry/sveltekit';
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

export default defineConfig(({ command, mode }) => {
	// Load environment variables from .env.local if it exists
	dotenv.config({ path: '.env.local' });

	// Check if Sentry is enabled
	const sentryEnabled = /^(true|1|yes|on)$/i.test((process.env['VITE_SENTRY_ENABLED'] || '').trim());

	const isProductionBuild = command === 'build' && mode === 'production';

	return {
		resolve: {
			...(process.env['VITEST'] ? { conditions: ['browser'] } : {}),
			alias: {
				'@/bridge/core-bridge': process.env['TAURI_SERVICE'] === 'true' ? path.resolve(__dirname, './src/modules/org.libersoft.messages/scripts/core-bridge-mobile.ts') : path.resolve(__dirname, './src/modules/org.libersoft.messages/scripts/core-bridge-builtin.ts'),
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
			// svelteInspector configured in svelte.config.js
		],
		define: {
			__BUILD_DATE__: JSON.stringify(new Date().toISOString()),
			__COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
			__BRANCH__: JSON.stringify(getGitBranch()),
			global: 'globalThis',
			/* Diagnostic console output is compiled out of production builds - roughly 500 call sites
			 * print arbitrary objects, and anything printed can end up in devtools, an exported log or
			 * a Sentry breadcrumb. console.error and console.warn are deliberately kept: they are what
			 * a user can be asked to read back. Anything that must survive should go through `log.*`
			 * (src/core/scripts/log.ts), which redacts secrets centrally.
			 * The replacement is a no-op call rather than a removal, so argument side effects are
			 * preserved and the minifier can drop what is left. */
			...(isProductionBuild
				? {
						'console.log': '((...args)=>{})',
						'console.debug': '((...args)=>{})',
						'console.info': '((...args)=>{})',
						'console.trace': '((...args)=>{})',
					}
				: {}),
		},
		server: {
			https: /** @type {any} */ (
				fs.existsSync(path.resolve(__dirname, 'server.key'))
					? {
							key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
							cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
						}
					: fs.existsSync(path.resolve(__dirname, 'certs/server.key'))
						? {
								key: fs.readFileSync(path.resolve(__dirname, 'certs/server.key')),
								cert: fs.readFileSync(path.resolve(__dirname, 'certs/server.crt')),
							}
						: undefined
			),
			allowedHosts: /** @type {const} */ (true),
			host: true,
			port: 3000,
		},
		/* Diagnostic console output is stripped from production builds. Errors and warnings are kept:
		 * they are what a user can be asked to read back, and they carry no payloads the way the
		 * debug logs do. Anything that must survive should go through `log.*` from
		 * src/core/scripts/log.ts, which is redacted centrally. */

		build: {
			chunkSizeWarningLimit: 6000,
			minify: process.env['VITE_BUILD_MINIFY'] !== 'false',
			//sourcemap: false,
			rollupOptions: {
				checks: {
					eval: false,
					pluginTimings: false,
				},
				transform: {
					inject: {
						Buffer: /** @type {[string, string]} */ (['buffer', 'Buffer']),
					},
				},
			},
		},
		optimizeDeps: {
			exclude: ['@tauri-apps/api'],
			include: ['buffer'],
		},
	};
});
