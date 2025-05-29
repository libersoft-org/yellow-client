<script lang="ts">
	import Button from '../../components/Button/Button.svelte';
	import Code from '../../components/Code/Code.svelte';
	import AccountsImportButtons from '../../components/AccountsImportButtons/AccountsImportButtons.svelte';
	import { onMount, onDestroy } from 'svelte';
	import jsQR from 'jsqr';

	type Props = {
		close: () => void;
	};

	let { close }: Props = $props();

	let videoElement: HTMLVideoElement | null = $state(null);
	let canvasElement: HTMLCanvasElement | null = $state(null);
	let stream: MediaStream | null = $state(null);
	let scanning = $state(false);
	let error = $state('');
	let lastProcessedCode = $state('');
	let scannedText = $state('');

	onMount(async () => {
		try {
			// Request camera access
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }, // Prefer back camera
			});

			if (videoElement) {
				videoElement.srcObject = stream;
				startScanning();
			}
		} catch (err) {
			error = 'Camera access denied or not available';
			console.error('Camera error:', err);
		}
	});

	onDestroy(() => {
		stopScanning();
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
		}
	});

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
				console.error('QR scanning error:', err);
			}
		}

		if (scanning) {
			requestAnimationFrame(scanFrame);
		}
	}

	function processQRCode(data: string) {
		// Stop scanning and show the scanned content
		stopScanning();
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
		}
		scannedText = data;
	}

	function handleError(message: string) {
		error = message;
	}

	function scanAgain() {
		scannedText = '';
		error = '';
		lastProcessedCode = '';
		startCamera();
	}

	async function startCamera() {
		try {
			// Stop existing stream if any
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
			error = 'Camera access denied or not available';
			console.error('Camera error:', err);
		}
	}
</script>

<style>
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
		max-height: 400px;
	}

	video {
		width: 100%;
		height: auto;
		border-radius: 10px;
	}

	canvas {
		display: none;
	}

	.error {
		color: #f00;
		text-align: center;
	}

	.instructions {
		text-align: center;
		color: #666;
	}

	.account-import {
		position: relative;
		width: 100%;

		@media (max-width: 768px) {
			width: 100%;
		}

		.scrollable {
			overflow: auto;
		}

		.buttons-container {
			margin-top: 10px;
			position: sticky;
			top: 0;
			left: 0;
			z-index: 1;
		}

		.error {
			color: #f00;
			text-align: center;
			margin-top: 10px;
		}
	}

	.scan-again-container {
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
	}
</style>

{#if scannedText}
	<!-- Show scanned content with same layout as JSON tab -->
	<div class="account-import">
		<div class="scan-again-container">
			<Button img="img/photo.svg" text="Scan Again" onClick={scanAgain} />
		</div>
		<div class="scrollable">
			<Code code={scannedText} />
		</div>
		{#if error}
			<div class="error">{error}</div>
		{/if}
		<div class="buttons-container">
			<AccountsImportButtons importText={scannedText} {close} onError={handleError} />
		</div>
	</div>
{:else}
	<!-- Show camera scanner -->
	<div class="qr-scanner">
		{#if error}
			<div class="error">{error}</div>
			<Button text="Cancel" onClick={close} />
		{:else}
			<div class="instructions">Point your camera at a QR code containing account configuration</div>
			<div class="video-container">
				<video bind:this={videoElement} autoplay playsinline>
					<track kind="captions" />
				</video>
				<canvas bind:this={canvasElement}></canvas>
			</div>
			<Button text="Cancel" onClick={close} />
		{/if}
	</div>
{/if}
