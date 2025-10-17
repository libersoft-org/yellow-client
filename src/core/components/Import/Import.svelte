<script lang="ts">
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Code from '@/core/components/Code/Code.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import QRScanner from '@/core/components/QRScanner/QRScanner.svelte';
	import { onMount, onDestroy } from 'svelte';
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
	let scannedText = $state('');
	let alertText: string = $state('');
	let qrScanner: QRScanner | undefined = $state();

	onMount(async () => {
		// QR scanner will auto-start if activeTab is 'qr'
	});

	onDestroy(() => {
		// QR scanner cleanup is handled by the component itself
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

	function handleQRScanned(data: string) {
		scannedText = data;
	}

	function handleQRError(error: string) {
		alertText = error;
	}

	async function handleTabChange(tab: string) {
		alertText = '';
		activeTab = tab;
		if (tab === 'qr' && !scannedText) {
			qrScanner?.start();
		} else if (tab === 'json') {
			qrScanner?.stop();
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
		<QRScanner bind:this={qrScanner} onScanned={handleQRScanned} onError={handleQRError} instructions={qrInstructions} testId={`${testId}-qr`} autoStart={activeTab === 'qr' && !scannedText} />
		{#if scannedText}
			{@render import_buttons()}
		{/if}
	{/if}
	{#if hasContent && alertText}
		<Alert type="error" message={alertText} />
	{/if}
</div>
