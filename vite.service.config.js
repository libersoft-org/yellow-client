import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/modules/org.libersoft.messages/service.ts'),
			name: 'YellowMessagesService',
			formats: ['iife'],
			fileName: () => 'messages-service.js',
		},
		outDir: 'dist/services',
		emptyOutDir: false,
		rollupOptions: {
			output: {
				// Ensure everything is bundled into a single file
				inlineDynamicImports: true,
				// Create a self-contained bundle
				format: 'iife',
				name: 'YellowMessagesService',
				// Add necessary globals
				intro: `
          // Globals that will be injected by native layer
          const TAURI_SERVICE = true;
          const send = globalThis.send || function() { console.warn('send() not injected'); };
        `,
			},
		},
		minify: false, // Keep readable for debugging
		sourcemap: false,
		target: 'es2020',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/core': path.resolve(__dirname, './src/core'),
			'@/org.libersoft.messages': path.resolve(__dirname, './src/modules/org.libersoft.messages'),
		},
	},
});
