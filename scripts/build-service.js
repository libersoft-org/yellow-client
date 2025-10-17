#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.join(__dirname, '..');

console.log('🔨 Building Messages Service...');

try {
	// Ensure output directory exists
	const distDir = path.join(projectRoot, 'dist');
	const servicesDir = path.join(distDir, 'services');

	if (!existsSync(distDir)) {
		mkdirSync(distDir, { recursive: true });
	}

	if (!existsSync(servicesDir)) {
		mkdirSync(servicesDir, { recursive: true });
	}

	// Run the build
	console.log('📦 Building service bundle...');
	execSync('npx vite build --config vite.service.config.js', {
		cwd: projectRoot,
		stdio: 'inherit',
	});

	// Check if the build was successful
	const outputFile = path.join(servicesDir, 'messages-service.js');
	if (existsSync(outputFile)) {
		console.log('✅ Messages service built successfully!');
		console.log(`📁 Output: ${outputFile}`);

		// Show file size
		const { size } = await import('fs').then(fs => fs.promises.stat(outputFile));
		console.log(`📏 Size: ${(size / 1024).toFixed(2)} KB`);
	} else {
		throw new Error('Build completed but output file not found');
	}
} catch (error) {
	console.error('❌ Build failed:', error.message);
	process.exit(1);
}
