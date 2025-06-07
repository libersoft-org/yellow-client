<script>
	import { onMount } from 'svelte';
	import { accounts_config } from '@/core/core.ts';
	import QRCode from 'qrcode';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	let qrCodeData = $state('');
	let dummyQrCodeData = $state('');
	let error = $state(null);
	let isRevealed = $state(false);

	onMount(() => {
		generateDummyQRCode();
		generateQRCode();
	});

	function generateDummyQRCode() {
		QRCode.toDataURL('DECODE ME', { width: 300, height: 300, margin: 0 })
			.then(url => (dummyQrCodeData = url))
			.catch(err => {
				console.error('DUMMY QR CODE GENERATION:', err);
			});
	}

	function generateQRCode() {
		error = null;
		const jsonString = JSON.stringify($accounts_config, null, 2);
		QRCode.toDataURL(jsonString, { width: 300, height: 300, margin: 0 })
			.then(url => (qrCodeData = url))
			.catch(err => {
				console.error('QR CODE GENERATION:', err);
				error = 'Failed to generate QR code. The data might be too large to be stored in a QR Code.';
			});
	}

	function toggleReveal() {
		isRevealed = !isRevealed;
	}
</script>

<style>
	.qr-page {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.qr-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		flex-direction: column;
	}

	.qr-image {
		transition: filter 0.3s ease;
		width: 300px;
		height: 300px;
		display: block;
	}

	.qr-image.blurred {
		filter: blur(8px);
	}

	.reveal-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.7);
		border-radius: 50%;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.reveal-icon img {
		width: 30px;
		height: 30px;
		filter: invert(1);
	}
</style>

<div class="qr-page">
	{#if error}
		<Alert type="error" message={error} />
	{:else if dummyQrCodeData && qrCodeData}
		{#if !isRevealed}
			<Alert type="warning" message="Sensitive information is hidden. Click the QR code to reveal it." />
		{:else}
			<Alert type="info" message="Click the QR code to hide it." />
		{/if}
		<div class="qr-wrapper">
			<Clickable onClick={toggleReveal} aria-label={isRevealed ? 'Hide QR code' : 'Reveal QR code'}>
				<img src={isRevealed ? qrCodeData : dummyQrCodeData} alt={isRevealed ? 'Account configuration QR code' : 'Hidden QR code'} class="qr-image" class:blurred={!isRevealed} />
			</Clickable>
			{#if !isRevealed}
				<div class="reveal-icon" aria-hidden="true">
					<img src="/modules/org.libersoft.wallet/img/hide.svg" alt="Eye icon" />
				</div>
			{/if}
		</div>
	{:else}
		<div>Generating QR code...</div>
	{/if}
</div>
