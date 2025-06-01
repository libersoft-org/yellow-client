<script lang="ts">
	import Button from '../components/Button/Button.svelte';
	import Input from '../components/Input/Input.svelte';
	import Label from '../components/Label/Label.svelte';
	import { log, TAURI, TAURI_MOBILE, BROWSER } from '../tauri.ts';
	import * as filesMobile from '../files-mobile.ts';
	import { offerNativeDownload, saveNativeDownloadChunk, finishNativeDownload, exportToSystemDownloads } from '../files.ts';
	import { platform, type as osType } from '@tauri-apps/plugin-os';
	import { invoke } from '@tauri-apps/api/core';
	import { onMount } from 'svelte';

	// Generate filename with compact datetime format: MMDD-HHmmss
	const now = new Date();
	const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '-' + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
	let fileName = `x-${dateStr}.html`;
	let fileContent = '<html><body>Hello from mobile file test!';
	let appendContent = '\nAppended content</body></html>';
	let newFileName = 'renamed-file.txt';
	let statusMessage = '';
	let createdFile: any = null;

	// For testing from old Files.svelte
	let download: any = null;
	let result: string = '';
	let defaultFolder: string = '/home/koom/Downloads';
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
			download = await offerNativeDownload('test-file.txt', null);
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
			download = await offerNativeDownload('test-file.txt', defaultFolder);
			result = `Download offered with default folder: ${JSON.stringify(download, null, 2)}`;
		} catch (error) {
			result = `Error: ${error}`;
		}
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
			const exportResult = await exportToSystemDownloads(download.temp_file_path, download.original_file_name, 'text/plain');
			if (exportResult.success) {
				result = 'File exported to Downloads folder successfully!';
			} else {
				result = `Export failed: ${exportResult.error}`;
			}
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	// Test functions for Files2.svelte (mobile operations)
	async function testCreateFile() {
		try {
			statusMessage = 'Creating file...';
			const result = await filesMobile.createDownloadFile(fileName);

			if ('error' in result) {
				statusMessage = `Error: ${result.error}`;
				return;
			}

			createdFile = result;

			// Write initial content
			if (fileContent) {
				await filesMobile.appendToDownloadFile(result.fileName, fileContent);
			}

			statusMessage = `File created: ${result.fileName}`;
			log.debug('File created:', JSON.stringify(result, null, 2));
		} catch (error) {
			statusMessage = `Error: ${error}`;
			log.error('Create file error:', error);
		}
	}

	async function testAppendToFile() {
		if (!createdFile) {
			statusMessage = 'Please create a file first';
			return;
		}

		try {
			statusMessage = 'Appending to file...';
			await filesMobile.appendToDownloadFile(createdFile.fileName, appendContent);
			statusMessage = `Appended content to: ${createdFile.fileName}`;
			log.debug('Content appended');
		} catch (error) {
			statusMessage = `Error: ${error}`;
			log.error('Append error:', error);
		}
	}

	async function testRenameFile() {
		if (!createdFile) {
			statusMessage = 'Please create a file first';
			return;
		}

		try {
			statusMessage = 'Renaming file...';
			await filesMobile.renameDownloadFile(createdFile.fileName, newFileName);
			createdFile.fileName = newFileName;
			statusMessage = `File renamed to: ${newFileName}`;
			log.debug('File renamed');
		} catch (error) {
			statusMessage = `Error: ${error}`;
			log.error('Rename error:', error);
		}
	}

	async function testExportFile() {
		if (!createdFile) {
			statusMessage = 'Please create a file first';
			return;
		}

		try {
			statusMessage = 'Opening save dialog...';
			const result = await filesMobile.exportFileWithDialog(createdFile.fileName);

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

	async function testDeleteFile() {
		if (!createdFile) {
			statusMessage = 'Please create a file first';
			return;
		}

		try {
			statusMessage = 'Deleting file...';
			await filesMobile.deleteDownloadFile(createdFile.fileName);
			statusMessage = `File deleted: ${createdFile.fileName}`;
			createdFile = null;
			log.debug('File deleted');
		} catch (error) {
			statusMessage = `Error: ${error}`;
			log.error('Delete error:', error);
		}
	}

	async function testFullWorkflow() {
		try {
			// Create file
			statusMessage = 'Starting full workflow...';
			const createResult = await filesMobile.createDownloadFile('workflow-test.txt');

			if ('error' in createResult) {
				statusMessage = `Create error: ${createResult.error}`;
				return;
			}

			// Write initial content
			await filesMobile.appendToDownloadFile(createResult.fileName, 'Initial content\n');
			await filesMobile.appendToDownloadFile(createResult.fileName, 'Second line\n');
			await filesMobile.appendToDownloadFile(createResult.fileName, 'Third line\n');

			// Export with dialog
			const exportResult = await filesMobile.exportFileWithDialog(createResult.fileName);

			if (exportResult.success) {
				statusMessage = 'Full workflow completed successfully!';
			} else {
				statusMessage = `Export failed: ${exportResult.error}`;
			}

			// Clean up
			await filesMobile.deleteDownloadFile(createResult.fileName);
		} catch (error) {
			statusMessage = `Workflow error: ${error}`;
			log.error('Workflow error:', error);
		}
	}
</script>

<style>
	.files2-test {
		width: 100%;
		padding: 10px;
	}

	h3 {
		margin-bottom: 15px;
		color: var(--text);
		font-size: 1.2em;
	}

	h4 {
		margin: 10px 0 5px 0;
		font-size: 0.9em;
		color: var(--text);
		opacity: 0.8;
	}

	.warning {
		color: var(--error);
		font-style: italic;
		text-align: center;
		padding: 20px;
	}

	.main-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.section {
		padding: 1px;
		background: var(--background-secondary);
		border-radius: 6px;
		border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
	}

	.section h3 {
		margin: 0 0 10px 0;
		font-size: 1em;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
	}

	.platform-info {
		background: var(--background-tertiary, #f0f0f0);
		padding: 8px;
		margin-bottom: 10px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.85em;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px;
	}

	.platform-info h4 {
		grid-column: 1 / -1;
		margin: 0 0 5px 0;
		font-size: 0.9em;
		font-weight: 600;
	}

	.platform-info-item {
		margin: 0;
		font-size: 0.8em;
	}

	.platform-info-item strong {
		display: inline-block;
		width: 80px;
		font-weight: 600;
	}

	.test-section {
	}

	.test-section :global(input) {
		width: 100%;
		font-size: 0.9em;
	}

	.button-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin: 10px 0;
	}

	.button-grid :global(button) {
		font-size: 0.85em;
		padding: 6px 10px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.button-grid :global(button:last-child:nth-child(odd)) {
		grid-column: 1 / -1;
	}

	.status-message {
		margin-top: 10px;
		padding: 10px;
		background: var(--background-secondary);
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.85em;
		white-space: pre-wrap;
		word-break: break-word;
		max-height: 150px;
		overflow-y: auto;
	}

	.file-info {
		background: var(--background-tertiary);
		border-radius: 4px;
		font-size: 0.85em;
	}

	.file-info h4 {
		margin: 0 0 5px 0;
		font-size: 0.9em;
		font-weight: 600;
	}

	.file-info p {
		margin: 3px 0;
		font-family: monospace;
		font-size: 0.85em;
	}

	.folder-input {
		margin-bottom: 8px;
	}

	.folder-input label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85em;
	}

	.folder-input input {
		flex: 1;
		padding: 4px 8px;
		font-size: 0.85em;
		border: 1px solid var(--border, #ccc);
		border-radius: 3px;
	}

	.result-area {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 10px;
	}

	.result-area textarea {
		width: 100%;
		font-family: monospace;
		font-size: 0.8em;
		border: 1px solid var(--border, #ccc);
		border-radius: 3px;
		padding: 6px;
		resize: vertical;
		min-height: 60px;
		max-height: 120px;
	}

	:global(label) {
		font-size: 0.85em;
		font-weight: 500;
		color: var(--text);
		opacity: 0.8;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.main-container {
			grid-template-columns: 1fr;
		}

		.platform-info {
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

	<div class="main-container">
		<!-- Left Column -->
		<div class="column">
			<div class="section">
				<h3>Common File Operations</h3>

				<div class="folder-input">
					<label>
						Default Folder:
						<input type="text" bind:value={defaultFolder} placeholder="Leave empty for dialog" />
					</label>
				</div>

				<div class="button-grid">
					<Button onClick={testPing}>Test Ping</Button>
					<Button onClick={testCheckPermissions}>Check Permissions</Button>
					<Button onClick={testOfferNativeDownload}>Offer Download</Button>
					<Button onClick={testOfferNativeDownloadWithDefaultFolder}>With Folder</Button>
					<Button onClick={testSaveNativeDownloadChunk}>Save Chunk</Button>
					<Button onClick={testFinishNativeDownload}>Finish Download</Button>
					{#if TAURI_MOBILE}
						<Button onClick={testExportToDownloads}>Export to Downloads</Button>
					{/if}
				</div>

				<div class="result-area">
					<h4>Result:</h4>
					<textarea readonly value={result || 'Click a button to test a function'} />
				</div>

				<div class="result-area">
					<h4>Download Object:</h4>
					<textarea readonly value={download ? JSON.stringify(download, null, 2) : 'No download object yet'} />
				</div>
			</div>
		</div>

		<!-- Right Column -->
		<div class="column">
			{#if TAURI_MOBILE}
				<div class="section">
					<h3>Mobile File Operations</h3>

					<div class="test-section">
						<Label>File Name:</Label>
						<Input bind:value={fileName} placeholder="Enter file name" />
					</div>

					<div class="test-section">
						<Label>File Content:</Label>
						<Input bind:value={fileContent} placeholder="Enter file content" />
					</div>

					<div class="test-section">
						<Label>Append Content:</Label>
						<Input bind:value={appendContent} placeholder="Content to append" />
					</div>

					<div class="test-section">
						<Label>New File Name:</Label>
						<Input bind:value={newFileName} placeholder="New name for rename" />
					</div>

					<div class="button-grid">
						<Button onClick={testCreateFile}>Create</Button>
						<Button onClick={testAppendToFile} disabled={!createdFile}>Append</Button>
						<Button onClick={testRenameFile} disabled={!createdFile}>Rename</Button>
						<Button onClick={testExportFile} disabled={!createdFile}>Export</Button>
						<Button onClick={testDeleteFile} disabled={!createdFile}>Delete</Button>
						<Button onClick={testFullWorkflow}>Full Workflow</Button>
					</div>

					{#if statusMessage}
						<div class="status-message">
							{statusMessage}
						</div>
					{/if}

					{#if createdFile}
						<div class="file-info">
							<h4>Current File Info:</h4>
							<p>Name: {createdFile.fileName}</p>
							<p>Temp: {createdFile.tempFileName}</p>
						</div>
					{/if}
				</div>
			{:else}
				<div class="section">
					<h3>Mobile Operations</h3>
					<p class="warning">Mobile-specific file operations are only available on mobile platforms.</p>
				</div>
			{/if}
		</div>
	</div>
</div>
