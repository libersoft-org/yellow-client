<script lang="ts">
	import { onMount } from 'svelte';
	import { product } from '@/core/scripts/stores.ts';
	import QRCode from 'qrcode';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import Code from '@/core/components/Code/Code.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	let { data, filename = 'export', enableJsonTab = true, enableQrTab = true, testId = 'export', isSensitive = false } = $props();
	let activeTab = $state('json');
	let jsonEditorContents = $state('');
	let qrCodeData = $state('');
	let dummyQrCodeData = $state('');
	let qrError = $state<string | null>(null);
	let isRevealed = $state(!isSensitive);
	let copyText = $state('Copy to clipboard');
	let timeoutId;
	let hiddenText = $state('[HIDDEN - Click reveal to show sensitive data][HIDDEN - Click reveal to show sensitive data][HIDDEN - Click reveal to show sensitive data]');

	$effect(() => {
		if (data) {
			// Pokud je data string, použij ho přímo, jinak JSON.stringify
			if (typeof data === 'string') {
				jsonEditorContents = data;
			} else {
				jsonEditorContents = JSON.stringify(data, null, 2);
			}
			if (enableQrTab) {
				generateQRCode();
			}
		}
	});

	$effect(() => {
		// React to activeTab changes
		activeTab;
		// Reset isRevealed to false when switching tabs if sensitive
		if (isSensitive) {
			console.log('Switching tabs, resetting isRevealed to false');
			isRevealed = false;
		}
	});

	onMount(() => {
		if (enableQrTab) {
			generateDummyQRCode();
		}
	});

	function generateDummyQRCode() {
		QRCode.toDataURL('DECODE ME', { width: 300, height: 300, margin: 0 })
			.then(url => (dummyQrCodeData = url))
			.catch(err => {
				console.error('DUMMY QR CODE GENERATION:', err);
			});
	}

	function generateQRCode() {
		qrError = null;
		// Use jsonEditorContents instead of JSON.stringify(data)
		const dataString = jsonEditorContents;
		QRCode.toDataURL(dataString, { width: 300, height: 300, margin: 0 })
			.then(url => (qrCodeData = url))
			.catch(err => {
				console.debug('QR CODE GENERATION:', err);
				qrError = 'Failed to generate QR code. The data might be too large to be stored in a QR Code.';
			});
	}

	function toggleReveal() {
		isRevealed = !isRevealed;
	}

	function clickCopy() {
		navigator.clipboard.writeText(jsonEditorContents);
		copyText = 'Copied!';
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			copyText = 'Copy to clipboard';
		}, 2000);
	}

	function clickDownload() {
		let blob = new Blob([jsonEditorContents], { type: 'application/json' });
		let url = URL.createObjectURL(blob);
		let a = document.createElement('a');
		a.href = url;
		a.download = product + '_' + filename + '_' + new Date().toISOString().replace('T', '_').replace('Z', '').replace(/\.\d+/, '') + '.json';
		a.click();
		setTimeout(() => {
			URL?.revokeObjectURL(url);
			a?.remove();
		}, 100000);
	}
</script>

<style>
	.export {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		height: 100%;
	}

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

{#snippet actionButtons(includeReveal = false)}
	{#if isSensitive && includeReveal}
		<Button img={isRevealed ? 'img/hide.svg' : 'img/show.svg'} text={isRevealed ? 'Hide' : 'Reveal'} onClick={toggleReveal} data-testid="{testId}-reveal-button" />
	{/if}
	<Button img="img/copy.svg" text={copyText} onClick={clickCopy} data-testid="{testId}-copy-button" />
	<Button img="img/download.svg" text="Download as file" onClick={clickDownload} data-testid="{testId}-download-button" />
{/snippet}

<div class="export" data-testid={testId}>
	{#if enableJsonTab && enableQrTab}
		<Tabs>
			<TabsItem img="img/json.svg" label="JSON" active={activeTab === 'json'} onClick={() => (activeTab = 'json')} testId="{testId}-json-tab" />
			<TabsItem img="img/qr.svg" label="QR Code" active={activeTab === 'qr'} onClick={() => (activeTab = 'qr')} testId="{testId}-qr-tab" />
		</Tabs>
	{/if}
	{#if activeTab === 'json' && enableJsonTab}
		{#if isSensitive}
			{#if !isRevealed}
				<Alert type="warning" message="Sensitive information is hidden. Click the reveal button to show it." testId="{testId}-json-warning" />
			{:else}
				<Alert type="info" message="Click the hide button to conceal sensitive information." testId="{testId}-json-info" />
			{/if}
			<ButtonBar expand>
				{@render actionButtons(true)}
			</ButtonBar>
			{#if isRevealed}
				<Code bind:code={jsonEditorContents} testId="{testId}-code-editor" />
			{:else}
				<Code bind:code={hiddenText} blur={true} testId="{testId}-code-editor-hidden" />
			{/if}
		{:else}
			<ButtonBar expand>
				{@render actionButtons()}
			</ButtonBar>
			<Code bind:code={jsonEditorContents} testId="{testId}-code-editor" />
		{/if}
	{:else if activeTab === 'qr' && enableQrTab}
		<div class="qr-page" data-testid="{testId}-qr-content">
			{#if qrError}
				<Alert type="error" message={qrError} testId="{testId}-qr-error" />
			{:else if dummyQrCodeData && qrCodeData}
				{#if isSensitive}
					{#if !isRevealed}
						<Alert type="warning" message="Sensitive information is hidden. Click the QR code to reveal it." testId="{testId}-qr-warning" />
					{:else}
						<Alert type="info" message="Click the QR code to hide it." testId="{testId}-qr-info" />
					{/if}
				{/if}
				<div class="qr-wrapper" data-testid="{testId}-qr-wrapper">
					{#if isSensitive}
						<Clickable onClick={toggleReveal} aria-label={isRevealed ? 'Hide QR code' : 'Reveal QR code'} data-testid="{testId}-qr-toggle">
							<img src={isRevealed ? qrCodeData : dummyQrCodeData} alt={isRevealed ? 'Export data QR code' : 'Hidden QR code'} class="qr-image" class:blurred={!isRevealed} data-testid="{testId}-qr-image" />
						</Clickable>
						{#if !isRevealed}
							<div class="reveal-icon" aria-hidden="true" data-testid="{testId}-qr-reveal-icon">
								<img src="img/show.svg" alt="Show" />
							</div>
						{/if}
					{:else}
						<img src={qrCodeData} alt="Export data QR code" class="qr-image" data-testid="{testId}-qr-image" />
					{/if}
				</div>
			{:else}
				<div data-testid="{testId}-qr-loading">Generating QR code...</div>
			{/if}
		</div>
	{/if}
</div>
