<script lang="ts">
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Code from '@/core/components/Code/Code.svelte';
	import { onMount, onDestroy, tick } from 'svelte';
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

	let elVideo: HTMLVideoElement | null = $state(null);
	let elCanvas: HTMLCanvasElement | null = $state(null);
	let stream: MediaStream | null = $state(null);
	let elScannerDiv: HTMLDivElement | null = $state(null);
	let scanning = $state(false);
	let lastProcessedCode = $state('');
	let scannedText = $state('');
	let alertText = $state('');
	let doMockVideo = $state(false);

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

			if (elVideo) {
				elVideo.srcObject = stream;
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
		if (!elScannerDiv) return;
		scanning = true;
		requestAnimationFrame(scanFrame);
	}

	function stopScanning() {
		scanning = false;
	}

	async function scanFrame() {
		console.log(`scanning: ${scanning}, elScannerDiv: ${elScannerDiv}, elVideo: ${elVideo}, elCanvas: ${elCanvas}`);

		if (!scanning || !elScannerDiv) return;

		if (elVideo || elCanvas) {
			const ctx = elCanvas?.getContext('2d');

			if (elCanvas) {
				if ((window as any).doMockVideo) {
					doMockVideo = true;
					elCanvas.width = 400;
					elCanvas.height = 300;
				}

				if (ctx && elVideo && elVideo.readyState === elVideo.HAVE_ENOUGH_DATA && !doMockVideo) {
					elCanvas.width = elVideo.videoWidth;
					elCanvas.height = elVideo.videoHeight;
				}

				await tick();

				if (ctx && ((elVideo && elVideo.readyState === elVideo.HAVE_ENOUGH_DATA) || doMockVideo)) {
					if (!doMockVideo && elVideo) {
						console.log('draw video');
						ctx.drawImage(elVideo, 0, 0, elCanvas.width, elCanvas.height);
					} else {
						console.log('wait for mock video');
					}
					let imageData: ImageData | null = null;
					try {
						imageData = ctx.getImageData(0, 0, elCanvas.width, elCanvas.height);
					} catch (err) {
						if (err instanceof DOMException && err.name === 'IndexSizeError') {
							console.debug('IndexSizeError:', err);
						} else console.debug('getImageData error:', err);
					}
					console.log('imageData length:', imageData?.data.length, 'width:', imageData?.width, 'height:', imageData?.height);
					if (imageData) {
						try {
							const code = jsQR(imageData.data, imageData.width, imageData.height);
							if (code && code.data !== lastProcessedCode) {
								console.log('QR code found:', code.data);
								lastProcessedCode = code.data;
								processQRCode(code.data);
								return;
							} else {
								console.log('No QR code found yet..');
							}
						} catch (err) {
							console.debug('QR scanning error:', err);
						}
					}
				}
			}
		}
		if (scanning) {
			//requestAnimationFrame(scanFrame);
			console.log('scheduling next scanFrame');
			setTimeout(scanFrame, 100);
		} else {
			console.log('stop scanning');
			console.log('stop scanning');
			console.log('stop scanning');
		}
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
		border-color: #333;
	}

	canvas {
		border-color: #333;
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
			<div bind:this={elScannerDiv} class="video-container">
				{#if !doMockVideo}
					<video bind:this={elVideo} autoplay playsinline data-testid={`${testId}-video`}>
						<track kind="captions" />
					</video>
				{/if}

				<canvas bind:this={elCanvas} class="qr-canvas" width="1600" height="1200" data-testid={`${testId}-canvas`}></canvas>
			</div>
		{/if}
	</div>
{/if}
