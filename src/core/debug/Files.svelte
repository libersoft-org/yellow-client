<script lang="ts">
	import Button from '../components/Button/Button.svelte';
	import Input from '../components/Input/Input.svelte';
	import Label from '../components/Label/Label.svelte';
	import { log, TAURI, TAURI_MOBILE, BROWSER } from '../tauri.ts';
	import { offerNativeDownload, saveNativeDownloadChunk, finishNativeDownload, openNativeDownload, defaultDownloadFolder, NativeDownload } from '../files.svelte.ts';
	import { platform, type as osType } from '@tauri-apps/plugin-os';
	import { onMount } from 'svelte';

	// Generate filename with compact datetime format: MMDD-HHmmss
	const now = new Date();
	const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '-' + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + '-' + Math.round(now.getSeconds() / 10).toString();
	let fileName = $state(`x-${dateStr}.html`);
	let appendContent = $state('<html><body>Hello from mobile file test!\nAppended content</body></html>');

	let download: NativeDownload | null = $state(null);
	let result: any = $state('');
	let platformInfo = $state({
		tauri: TAURI,
		tauriMobile: TAURI_MOBILE,
		browser: BROWSER,
		platform: 'unknown',
		osType: 'unknown',
	});

	onMount(async () => {
		if (TAURI) {
			try {
				platformInfo.platform = platform();
				platformInfo.osType = await osType();
			} catch (error) {
				log.error('Failed to get platform info:', error);
			}
		}
	});

	// Test functions from Files.svelte
	async function testOfferNativeDownload() {
		log.debug('testOfferNativeDownload');
		try {
			result = 'Testing offerNativeDownload...';
			result = await offerNativeDownload(fileName);
			log.debug('Offer download result:', result);
			if (result instanceof NativeDownload) {
				download = result;
			} else {
				download = null;
			}
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
			const testData = new Blob([appendContent]);
			result = await saveNativeDownloadChunk(download, testData);
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
			result = await finishNativeDownload(download);
		} catch (error) {
			result = `Error: ${error}`;
		}
	}

	async function testOpenDownload() {
		if (TAURI_MOBILE) {
			try {
				if (!download) {
					result = 'No download object. Run offerNativeDownload first!';
					return;
				}
				result = 'Opening save dialog...';
				result = await openNativeDownload(download);
				log.debug('Export result:', result);
			} catch (error) {
				result = `Error: ${error}`;
				log.error('Export error:', error);
			}
		} else {
			result = 'Export is no-op on desktop (file already saved to chosen location)';
			return;
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

	.platform-info {
		display: flex;
		flex-wrap: wrap;
	}

	.platform-info-item {
		margin-right: 10px;
	}

	.platform-info-item strong {
		min-width: 50px;
		font-weight: 600;
	}

	.file-info {
		display: grid;
		grid-template-columns: repeat(2, 1fr);

		margin-top: 6px;
		padding: 6px;
		border-radius: 3px;
		font-size: 0.75em;
		border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
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
		border-radius: 3px;
	}

	.folder-section :global(label) {
		flex: 1;
	}

	/* Buttons grid */
	.buttons-grid {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
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

		.file-info {
			grid-template-columns: 1fr;
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
			<Button onClick={testOpenDownload} disabled={!download}>Open</Button>
		</div>

		<!-- Status Display -->
		<div class="file-info">
			{#if result}
				<div>
					<p><strong>Result:</strong></p>
					<pre>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
				</div>
			{/if}

			<!-- File Info Display -->
			{#if download}
				<div>
					<p><strong>Download Object:</strong></p>
					<pre>{JSON.stringify(download, null, 2)}</pre>
				</div>
			{/if}
		</div>
	</div>
</div>
