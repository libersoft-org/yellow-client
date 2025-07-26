<script lang="ts">
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Code from '@/core/components/Code/Code.svelte';
	import { onMount, onDestroy } from 'svelte';
	import jsQR from 'jsqr';

	interface Props {
		onScanned: (data: string) => void;
		onError?: (error: string) => void;
		instructions?: string;
		testId?: string;
		scanAgainText?: string;
		autoStart?: boolean;
	}

	let { onScanned, onError, instructions = 'Point your camera at a QR code', testId = 'qr-scanner', scanAgainText = 'Scan again', autoStart = true }: Props = $props();

	let videoElement: HTMLVideoElement | null = $state(null);
	let canvasElement: HTMLCanvasElement | null = $state(null);
	let stream: MediaStream | null = $state(null);
	let scanning = $state(false);
	let lastProcessedCode = $state('');
	let scannedText = $state('');
	let alertText = $state('');

	onMount(async () => {
		if (autoStart) await startCamera();
	});

	onDestroy(() => {
		stopScanning();
		if (stream) stream.getTracks().forEach(track => track.stop());
	});

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
			const errorMessage = 'Camera access denied or not available';
			alertText = errorMessage;
			if (onError) onError(errorMessage);
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
		onScanned(data);
	}

	function scanAgain() {
		scannedText = '';
		alertText = '';
		lastProcessedCode = '';
		startCamera();
	}

	export function reset() {
		scannedText = '';
		alertText = '';
		lastProcessedCode = '';
		if (autoStart) startCamera();
	}

	export function start() {
		startCamera();
	}

	export function stop() {
		stopScanning();
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			stream = null;
		}
	}

	export { scannedText as data };
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

{#if scannedText}
	<div class="qr-content">
		<div class="scan-again-container">
			<ButtonBar expand>
				<Button img="img/qr.svg" text={scanAgainText} onClick={scanAgain} data-testid={`${testId}-scan-again`} />
			</ButtonBar>
		</div>
		<div class="scrollable">
			<Code code={scannedText} testId={`${testId}-result`} />
		</div>
	</div>
{:else}
	<div class="qr-scanner">
		{#if alertText}
			<Alert type="error" message={alertText} />
		{:else}
			<div class="instructions">{instructions}</div>
			<div class="video-container">
				<video bind:this={videoElement} autoplay playsinline data-testid={`${testId}-video`}>
					<track kind="captions" />
				</video>
				<canvas bind:this={canvasElement}></canvas>
			</div>
		{/if}
	</div>
{/if}
