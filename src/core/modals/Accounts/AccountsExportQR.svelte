<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { accounts_config } from '@/core/core.ts';
	let qrCodeData = $state('');
	let dummyQrCodeData = $state('');
	let error = $state('');
	let isRevealed = $state(false);

	onMount(() => {
		generateDummyQRCode();
		generateQRCode();
	});

	function generateDummyQRCode() {
		QRCode.toDataURL('DECODE ME', { width: 300 })
			.then(url => (dummyQrCodeData = url))
			.catch(err => {
				console.error('DUMMY QR CODE GENERATION:', err);
			});
	}

	function generateQRCode() {
		error = '';
		const jsonString = JSON.stringify($accounts_config, null, 2);
		QRCode.toDataURL(jsonString, { width: 300 })
			.then(url => (qrCodeData = url))
			.catch(err => {
				console.error('QR CODE GENERATION:', err);
				error = 'Failed to generate QR code. The data might be too large.';
			});
	}

	function toggleReveal() {
		isRevealed = !isRevealed;
	}
</script>

<style>
	.qr-container {
		display: flex;
		justify-content: center;
		padding: 0px;
	}

	.qr-wrapper {
		display: flex;
		position: relative;
		flex-direction: column;
	}

	.qr-image {
		display: block;
		transition: filter 0.3s ease;
	}

	.qr-image.blurred {
		filter: blur(8px);
	}

	.reveal-button {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.7);
		border: none;
		border-radius: 50%;
		width: 60px;
		height: 60px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.3s ease;
	}

	.reveal-button:hover {
		background: rgba(0, 0, 0, 0.85);
	}

	.reveal-button img {
		width: 30px;
		height: 30px;
		filter: invert(1);
	}

	.error {
		color: #f00;
		text-align: center;
		margin-top: 10px;
	}
</style>

<div class="qr-container">
	{#if error}
		<div class="error">{error}</div>
	{:else if dummyQrCodeData && qrCodeData}
		<div class="qr-wrapper">
			{#if !isRevealed}
				<div class="instructions">Sensitive information is hidden. Click the eye icon to reveal the QR code.</div>
			{/if}
			<img src={isRevealed ? qrCodeData : dummyQrCodeData} alt={isRevealed ? 'Account configuration QR code' : 'Hidden QR code'} class="qr-image" class:blurred={!isRevealed} />
			{#if !isRevealed}
				<button class="reveal-button" onclick={toggleReveal} aria-label="Reveal QR code">
					<img src="/modules/org.libersoft.wallet/img/hide.svg" alt="Eye icon" />
				</button>
			{/if}
		</div>
	{:else}
		<div>Generating QR code...</div>
	{/if}
</div>
