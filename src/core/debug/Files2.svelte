<script lang="ts">
	import Button from '../components/Button/Button.svelte';
	import Input from '../components/Input/Input.svelte';
	import Label from '../components/Label/Label.svelte';
	import { log, TAURI, TAURI_MOBILE, BROWSER } from '../tauri.ts';
	import { offerNativeDownload, saveNativeDownloadChunk, finishNativeDownload, exportToSystemDownloads, createDownloadFile, appendToFile, renameFile, deleteFile, exportFileWithDialog, defaultDownloadFolder } from '../files.ts';
	import { platform, type as osType } from '@tauri-apps/plugin-os';
	import { invoke } from '@tauri-apps/api/core';
	import { onMount } from 'svelte';

	// Generate filename with compact datetime format: MMDD-HHmmss
	const now = new Date();
	const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '-' + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
	let fileName = `x-${dateStr}.html`;
	let appendContent = '<html><body>Hello from mobile file test!\nAppended content</body></html>';
	let statusMessage = '';

	// For testing from old Files.svelte
	let download: any = null;
	let result: string = '';
	let platformInfo = {
		tauri: TAURI,
		tauriMobile: TAURI_MOBILE,
		browser: BROWSER,
		platform: 'unknown',
		osType: 'unknown',
	};

	onMount(async () => {
		if (TAURI) {
			try {
				platformInfo.platform = platform();
				platformInfo.osType = await osType();
			} catch (error) {
				console.error('Failed to get platform info:', error);
			}
		}
	});

	// Test functions from Files.svelte
	async function testOfferNativeDownload() {
		console.log('testOfferNativeDownload');
		try {
			result = 'Testing offerNativeDownload...';
			download = await offerNativeDownload(fileName, null);
			result = `Download offered: ${JSON.stringify(download, null, 2)}`;
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	async function testPing() {
		console.log('Testing yellow plugin ping command');
		try {
			const response = await invoke('plugin:yellow|ping', { payload: { value: 'Hello from client!' } });
			console.log('Ping response:', response);
			result = `Ping response: ${JSON.stringify(response, null, 2)}`;
		} catch (error) {
			console.error('Ping error:', error);
			result = `Ping error: ${error}`;
		}
	}

	async function testCheckPermissions() {
		console.log('Testing checkFilePermissions command directly');
		try {
			const response = await invoke('plugin:yellow|check_file_permissions');
			console.log('checkFilePermissions response:', response);
			result = `checkFilePermissions response: ${JSON.stringify(response, null, 2)}`;
		} catch (error) {
			console.error('checkFilePermissions error:', error);
			result = `checkFilePermissions error: ${error}`;
		}
	}

	async function testOfferNativeDownloadWithDefaultFolder() {
		console.log('testOfferNativeDownloadWithDefaultFolder');
		try {
			result = 'Testing offerNativeDownload with default folder...';
			download = await offerNativeDownload('test-file.txt', $defaultDownloadFolder);
			result = `Download offered with default folder: ${JSON.stringify(download, null, 2)}`;
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	async function setDefaultFolderFromDownload() {
		if (!download || !download.potential_default_folder) {
			result = 'No download with folder selected. Use "Offer Download" first.';
			return;
		}

		defaultDownloadFolder.set(download.potential_default_folder);
		result = `Default folder set to: ${download.potential_default_folder}`;
	}

	async function testSaveNativeDownloadChunk() {
		try {
			if (!download) {
				result = 'No download object. Run offerNativeDownload first!';
				return;
			}
			result = 'Testing saveNativeDownloadChunk...';
			const testData = new Blob(['This is test data chunk']);
			await saveNativeDownloadChunk(download, testData);
			result = 'Chunk saved successfully!';
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	async function testFinishNativeDownload() {
		try {
			if (!download) {
				result = 'No download object. Run offerNativeDownload first!';
				return;
			}
			result = 'Testing finishNativeDownload...';
			await finishNativeDownload(download);
			result = 'Download finished successfully!';
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	async function testExportToDownloads() {
		try {
			if (!download) {
				result = 'No download.';
				return;
			}
			result = 'Exporting to system Downloads...';
			// Use file_path if download is finished, otherwise use temp_file_path
			const filePath = download.finished ? download.file_path : download.temp_file_path;
			const exportResult = await exportToSystemDownloads(filePath, download.original_file_name, 'text/plain');
			if (exportResult.success) {
				result = 'File exported to Downloads folder successfully!';
			} else {
				result = `Export failed: ${exportResult.error}`;
			}
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	async function testExportFile() {
		if (!TAURI_MOBILE) {
			statusMessage = 'Export is no-op on desktop (file already saved to chosen location)';
			return;
		}

		if (!download) {
			statusMessage = 'Please create a download first';
			return;
		}

		try {
			statusMessage = 'Opening save dialog...';
			const filePath = download.finished ? download.file_path : download.temp_file_path;
			const result = await exportFileWithDialog(filePath);

			if (result.success) {
				statusMessage = 'File exported successfully!';
			} else {
				statusMessage = `Export failed: ${result.error}`;
			}

			log.debug('Export result:', result);
		} catch (error) {
			statusMessage = `Error: ${error}`;
			log.error('Export error:', error);
		}
	}

	async function testFullWorkflow() {
		try {
			// Create file
			statusMessage = 'Starting full workflow...';
			const createResult = await createDownloadFile('workflow-test.txt', 'Initial content\n');

			if ('error' in createResult) {
				statusMessage = `Create error: ${createResult.error}`;
				return;
			}

			// Append more content
			await appendToFile(createResult.file_path, 'Second line\n');
			await appendToFile(createResult.file_path, 'Third line\n');

			// Export with dialog
			const exportResult = await exportFileWithDialog(createResult.file_path);

			if (exportResult.success) {
				statusMessage = 'Full workflow completed successfully!';
			} else {
				statusMessage = `Export failed: ${exportResult.error}`;
			}

			// Clean up
			await deleteFile(createResult.file_path);
		} catch (error) {
			statusMessage = `Workflow error: ${error}`;
			log.error('Workflow error:', error);
		}
	}
</script>

<style>
	.files2-test {
		font-size: 0.8em;
	}

	.content {
		padding: 10px;
	}

	h3 {
		margin: 0 0 10px 0;
		color: var(--text);
		font-size: 1.1em;
		border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
		padding-bottom: 5px;
	}

	h4 {
		margin: 5px 0 3px 0;
		font-size: 0.85em;
		color: var(--text);
		opacity: 0.8;
	}

	.platform-info {
		background: var(--background-tertiary, #f0f0f0);
		padding: 4px 6px;
		margin-bottom: 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.75em;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.platform-info-item {
		margin: 0;
		font-size: inherit;
	}

	.platform-info-item strong {
		display: inline-block;
		min-width: 50px;
		font-weight: 600;
	}

	.test-section {
	}

	.test-section :global(input) {
		width: 100%;
		font-size: 0.85em;
		padding: 3px 6px;
		height: 24px;
	}

	.test-section :global(label) {
		font-size: 0.8em;
		margin-bottom: 2px;
		display: block;
	}

	.status-message {
		margin-top: 6px;
		padding: 6px;
		background: var(--background-secondary);
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.75em;
		white-space: pre-wrap;
		word-break: break-word;
		max-height: 80px;
		overflow-y: auto;
		border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
	}

	.file-info {
		margin-top: 6px;
		padding: 6px;
		background: var(--background-tertiary);
		border-radius: 3px;
		font-size: 0.75em;
		border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
	}

	.file-info h4 {
		margin: 0 0 3px 0;
		font-size: 0.85em;
		font-weight: 600;
	}

	.file-info p {
		margin: 2px 0;
		font-family: monospace;
		font-size: inherit;
	}

	.file-info pre {
		margin: 3px 0;
		padding: 4px;
		background: var(--background-primary, #f5f5f5);
		border-radius: 2px;
		font-size: 0.9em;
		overflow-x: auto;
		max-height: 100px;
		overflow-y: auto;
	}

	.folder-input {
		margin-bottom: 4px;
	}

	.folder-input label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8em;
	}

	.folder-input input {
		flex: 1;
		padding: 2px 4px;
		font-size: 0.8em;
		border: 1px solid var(--border, #ccc);
		border-radius: 2px;
		height: 20px;
	}

	/* Compact inputs and labels globally */
	:global(.files2-test label) {
		font-size: 0.75em;
		font-weight: 500;
		color: var(--text);
		opacity: 0.8;
	}

	/* Inputs grid */
	.inputs-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 10px;
	}

	.input-item {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.input-item :global(input) {
		width: 100%;
		font-size: 0.85em;
		padding: 4px 6px;
		height: 26px;
	}

	/* Folder section */
	.folder-section {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
		padding: 5px;
		background: var(--background-tertiary, rgba(0, 0, 0, 0.03));
		border-radius: 3px;
	}

	.folder-section :global(label) {
		flex: 1;
	}

	/* Buttons grid */
	.buttons-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}

	.buttons-grid :global(button) {
		font-size: 0.75em;
		padding: 5px 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-height: 28px;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.platform-info {
			font-size: 0.7em;
		}

		.inputs-grid,
		.buttons-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.folder-section {
			flex-direction: column;
			align-items: stretch;
			gap: 5px;
		}
	}

	@media (max-width: 480px) {
		.inputs-grid,
		.buttons-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

<div class="files2-test">
	<div class="platform-info">
		<div class="platform-info-item">
			<strong>TAURI:</strong>
			{platformInfo.tauri}
		</div>
		<div class="platform-info-item">
			<strong>MOBILE:</strong>
			{platformInfo.tauriMobile}
		</div>
		<div class="platform-info-item">
			<strong>BROWSER:</strong>
			{platformInfo.browser}
		</div>
		<div class="platform-info-item">
			<strong>Platform:</strong>
			{platformInfo.platform}
		</div>
		<div class="platform-info-item">
			<strong>OS Type:</strong>
			{platformInfo.osType}
		</div>
	</div>

	<div class="content">
		<h3>File Operations Test</h3>

		<!-- Inputs Section -->
		<div class="inputs-grid">
			<div class="input-item">
				<Label>suggested File Name:</Label>
				<Input bind:value={fileName} placeholder="filename.txt" />
			</div>

			<div class="input-item">
				<Label>Append content:</Label>
				<Input bind:value={appendContent} placeholder="append text" />
			</div>

			<!-- Default Folder (Desktop only) -->
			{#if !TAURI_MOBILE}
				<div class="folder-section">
					<Label>Default folder: {$defaultDownloadFolder || '(not set)'}</Label>
					<Button onClick={setDefaultFolderFromDownload} disabled={!download?.potential_default_folder}>Set from download</Button>
				</div>
			{/if}
		</div>

		<!-- Action Buttons -->
		<div class="buttons-grid">
			<Button onClick={testOfferNativeDownload}>Offer Download</Button>
			<Button onClick={testSaveNativeDownloadChunk} disabled={!download}>Save Chunk</Button>
			<Button onClick={testFinishNativeDownload} disabled={!download}>Finish</Button>
			<Button onClick={testExportFile} disabled={!download}>Export</Button>
			{#if TAURI_MOBILE}
				<Button onClick={testExportToDownloads} disabled={!download}>Downloads</Button>
			{/if}
			<Button onClick={testFullWorkflow}>Workflow</Button>
			<Button onClick={testPing}>Ping</Button>
			<Button onClick={testCheckPermissions}>Perms</Button>
			{#if !TAURI_MOBILE}
				<Button onClick={testOfferNativeDownloadWithDefaultFolder}>Folder DL</Button>
			{/if}
		</div>

		<!-- Status Display -->
		{#if statusMessage || result}
			<div class="status-message">
				{statusMessage || result || 'Click a button to test a function'}
			</div>
		{/if}

		<!-- File Info Display -->
		{#if download}
			<div class="file-info">
				<h4>Current File Info:</h4>
				{#if download}
					<p><strong>Download Object:</strong></p>
					<pre>{JSON.stringify(download, null, 2)}</pre>
				{/if}
			</div>
		{/if}
	</div>
</div>
