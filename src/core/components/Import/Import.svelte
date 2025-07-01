<script lang="ts">
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Code from '@/core/components/Code/Code.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { onMount, onDestroy } from 'svelte';
	import jsQR from 'jsqr';
	interface Props {
		onValidate: (text: string) => { valid: boolean; error?: string };
		onAdd: (text: string) => Promise<void>;
		onReplace?: (text: string) => Promise<void>;
		onSuccess?: (message: string) => void;
		testId: string;
		jsonLabel?: string;
		qrLabel?: string;
		addButtonText?: string;
		replaceButtonText?: string;
		fileAccept?: string;
		browseButtonText?: string;
		qrInstructions?: string;
	}
	let { onValidate, onAdd, onReplace, onSuccess, testId, jsonLabel = 'JSON', qrLabel = 'QR Code', addButtonText = 'Add', replaceButtonText = 'Replace All', fileAccept = '.json,application/json', browseButtonText = 'Open file', qrInstructions = 'Point your camera at a QR code' }: Props = $props();
	let activeTab = $state('json');
	let text = $state('');
	let fileInput: HTMLInputElement | undefined = $state();
	// QR scanner state
	let videoElement: HTMLVideoElement | null = $state(null);
	let canvasElement: HTMLCanvasElement | null = $state(null);
	let stream: MediaStream | null = $state(null);
	let scanning = $state(false);
	let lastProcessedCode = $state('');
	let scannedText = $state('');
	let alertText: string = $state('');

	onMount(async () => {
		if (activeTab === 'qr') await startCamera();
	});

	onDestroy(() => {
		stopScanning();
		if (stream) stream.getTracks().forEach(track => track.stop());
	});

	function handleError(message: string) {
		console.debug('handleError:', message);
		alertText = message;
	}

	function loadFile() {
		fileInput?.click();
	}

	function handleFileSelect(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = e => {
				text = (e.target?.result as string) || '';
			};
			reader.readAsText(file);
		}
	}

	async function handleAdd() {
		const currentText = activeTab === 'json' ? text : scannedText;
		const validation = onValidate(currentText);
		if (!validation.valid) {
			handleError(validation.error || 'Invalid data');
			return;
		}
		try {
			await onAdd(currentText);
			console.debug('handleAdd: Import finished');
		} catch (err) {
			console.debug('handleAdd: Import error:', err);
			handleException(err);
		}
	}

	export async function doContinue(fn: () => Promise<void>) {
		try {
			await fn();
			console.debug('doContinue: Import finished');
		} catch (err) {
			console.debug('doContinue: Import error:', err);
			handleException(err);
		}
	}

	export function handleException(err: unknown) {
		if (err instanceof Error && err.name === 'ImportSuccessWithWarnings' && onSuccess) onSuccess(err.message);
		else handleError(err instanceof Error ? err.message : 'Unknown error');
	}

	async function handleReplace() {
		if (!onReplace) {
			console.log('handleReplace: onReplace function is not defined');
			return;
		}
		const currentText = activeTab === 'json' ? text : scannedText;
		const validation = onValidate(currentText);
		if (!validation.valid) {
			console.debug('handleReplace: Validation failed:', validation.error);
			handleError(validation.error || 'Invalid data');
			return;
		}
		try {
			console.debug('handleReplace: Replacing data');
			await onReplace(currentText);
		} catch (err) {
			console.debug('handleReplace: Replace error:', err);
			handleException(err);
		}
	}

	// QR Scanner functions
	async function startCamera() {
		try {
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}

			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			});

			if (videoElement) {
				videoElement.srcObject = stream;
				startScanning();
			}
		} catch (err) {
			alertText = 'Camera access denied or not available';
			console.debug('Camera error:', err);
		}
	}

	function startScanning() {
		if (!videoElement || !canvasElement) return;
		scanning = true;
		requestAnimationFrame(scanFrame);
	}

	function stopScanning() {
		scanning = false;
	}

	function scanFrame() {
		if (!scanning || !videoElement || !canvasElement) return;
		const canvas = canvasElement;
		const video = videoElement;
		const ctx = canvas.getContext('2d');
		if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			try {
				const code = jsQR(imageData.data, imageData.width, imageData.height);
				if (code && code.data !== lastProcessedCode) {
					lastProcessedCode = code.data;
					processQRCode(code.data);
					return;
				}
			} catch (err) {
				console.debug('QR scanning error:', err);
			}
		}
		if (scanning) requestAnimationFrame(scanFrame);
	}

	function processQRCode(data: string) {
		stopScanning();
		if (stream) stream.getTracks().forEach(track => track.stop());
		scannedText = data;
	}

	function scanAgain() {
		scannedText = '';
		alertText = '';
		lastProcessedCode = '';
		startCamera();
	}

	async function handleTabChange(tab: string) {
		alertText = '';
		activeTab = tab;
		if (tab === 'qr' && !scannedText) {
			await startCamera();
		} else if (tab === 'json') {
			stopScanning();
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
				stream = null;
			}
		}
	}

	$effect(() => {
		if (text || scannedText) alertText = '';
	});

	const hasContent = $derived((activeTab === 'json' && text) || (activeTab === 'qr' && scannedText));
	const showReplaceButton = $derived(hasContent && onReplace);
</script>

<style>
	.import {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		gap: 10px;
	}

	.qr-scanner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 20px;
	}

	.video-container {
		position: relative;
		max-width: 100%;
		max-height: 100%;
	}

	video {
		width: 100%;
		height: auto;
		border-radius: 10px;
	}

	canvas {
		display: none;
	}

	.instructions {
		text-align: center;
		color: var(--default-foreground);
	}

	.qr-content {
		position: relative;
		width: 100%;
	}

	.qr-content .scrollable {
		overflow: auto;
	}

	.scan-again-container {
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
	}
</style>

{#snippet import_buttons()}
	<ButtonBar align="center" equalize>
		<Button img="img/add.svg" text={addButtonText} enabled={!!hasContent} onClick={handleAdd} data-testid={`${testId}-add-btn`} />
		<Button img="img/import.svg" text={replaceButtonText} enabled={!!hasContent && !!showReplaceButton} onClick={handleReplace} data-testid={`${testId}-replace-btn`} />
	</ButtonBar>
{/snippet}
<div class="import">
	<Tabs>
		<TabsItem img="img/json.svg" label={jsonLabel} active={activeTab === 'json'} onClick={() => handleTabChange('json')} testId={`${testId}-json-tab`} />
		<TabsItem img="img/qr.svg" label={qrLabel} active={activeTab === 'qr'} onClick={() => handleTabChange('qr')} testId={`${testId}-qr-tab`} />
	</Tabs>
	{#if activeTab === 'json'}
		<ButtonBar expand>
			<Button img="img/open.svg" onclick={loadFile} text={browseButtonText} />
		</ButtonBar>
		<Code bind:code={text} testId={`${testId}-textarea`} />
		<input bind:this={fileInput} type="file" accept={fileAccept} style="display: none;" onchange={handleFileSelect} />
		{@render import_buttons()}
	{:else if activeTab === 'qr'}
		{#if scannedText}
			<div class="qr-content">
				<div class="scan-again-container">
					<ButtonBar expand>
						<Button img="img/qr.svg" text="Scan again" onClick={scanAgain} />
					</ButtonBar>
				</div>
				<div class="scrollable">
					<Code code={scannedText} testId={`${testId}-textarea`} />
				</div>
			</div>
			{@render import_buttons()}
		{:else}
			<div class="qr-scanner">
				{#if alertText}
					<Alert type="error" message={alertText} />
				{:else}
					<div class="instructions">{qrInstructions}</div>
					<div class="video-container">
						<video bind:this={videoElement} autoplay playsinline>
							<track kind="captions" />
						</video>
						<canvas bind:this={canvasElement}></canvas>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
	{#if hasContent && alertText}
		<Alert type="error" message={alertText} />
	{/if}
</div>
