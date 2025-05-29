<script lang="ts">
	import Button from '../components/Button/Button.svelte';
	import Input from '../components/Input/Input.svelte';
	import Label from '../components/Label/Label.svelte';
	import { log, TAURI_MOBILE } from '../tauri.ts';
	import * as filesMobile from '../files-mobile.ts';

	let fileName = 'test-file.txt';
	let fileContent = 'Hello from mobile file test!';
	let appendContent = '\nAppended content';
	let newFileName = 'renamed-file.txt';
	let statusMessage = '';
	let createdFile: any = null;

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
			log.debug('File created:', result);
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
		padding: 20px;
		max-width: 600px;
		margin: 0 auto;
	}

	h3 {
		margin-bottom: 20px;
		color: var(--color-text);
	}

	.warning {
		color: var(--color-error);
		font-style: italic;
		text-align: center;
		padding: 20px;
	}

	.test-section {
		margin-bottom: 15px;
	}

	.button-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		margin: 20px 0;
	}

	.button-grid :global(button:last-child) {
		grid-column: 1 / -1;
	}

	.status-message {
		margin-top: 20px;
		padding: 15px;
		background: var(--color-background-secondary);
		border-radius: 4px;
		font-family: monospace;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.file-info {
		margin-top: 20px;
		padding: 15px;
		background: var(--color-background-tertiary);
		border-radius: 4px;
	}

	.file-info h4 {
		margin: 0 0 10px 0;
		font-size: 14px;
		font-weight: 600;
	}

	.file-info p {
		margin: 5px 0;
		font-size: 13px;
		font-family: monospace;
	}
</style>

<div class="files2-test">
	<h3>Mobile File Operations Test</h3>

	{#if !TAURI_MOBILE}
		<p class="warning">This test is only available on mobile platforms.</p>
	{:else}
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
			<Button onClick={testCreateFile}>Create File</Button>
			<Button onClick={testAppendToFile} disabled={!createdFile}>Append to File</Button>
			<Button onClick={testRenameFile} disabled={!createdFile}>Rename File</Button>
			<Button onClick={testExportFile} disabled={!createdFile}>Export with Dialog</Button>
			<Button onClick={testDeleteFile} disabled={!createdFile}>Delete File</Button>
			<Button onClick={testFullWorkflow}>Test Full Workflow</Button>
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
				<p>Temp Name: {createdFile.tempFileName}</p>
			</div>
		{/if}
	{/if}
</div>
