<script lang="ts">
	import { getContext } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { generateMnemonic, addWallet, wallets } from 'libersoft-crypto/wallet';
	import { validateForm } from '@/core/scripts/utils/form.ts';
	import type { Mnemonic } from 'ethers';
	import Form from '@/core/components/Form/Form.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import QRCode from 'qrcode';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	interface Props {
		close?: () => void;
	}
	let { close }: Props = $props();
	let name: string | undefined = $state();
	let mnemonic: Mnemonic | undefined = $state();
	let phrase: string = $state('');
	let copied: boolean = $state(false);
	let qrCodeData: string = $state('');
	let dummyQrCodeData: string = $state('');
	let dummyPhrase: string = $state('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation');
	let isRevealed: boolean = $state(false);
	let error: string | null | undefined = $state();
	let elWalletNameInput: Input | undefined = $state();
	const setSettingsSection = getContext<Function>('setSettingsSection');

	export function onOpen() {
		name = 'My wallet ' + ($wallets.length + 1);
		regenerate();
		generateDummyQRCode();
		isRevealed = false;
		error = null;
		if (elWalletNameInput) elWalletNameInput.focus();
	}

	function generateQRCode() {
		QRCode.toDataURL(phrase, { width: 150 })
			.then(url => (qrCodeData = url))
			.catch(err => console.error(err));
	}

	function generateDummyQRCode() {
		QRCode.toDataURL(dummyPhrase, { width: 150 })
			.then(url => (dummyQrCodeData = url))
			.catch(err => console.error(err));
	}

	function toggleReveal() {
		isRevealed = !isRevealed;
	}

	function regenerate() {
		mnemonic = generateMnemonic();
		phrase = mnemonic?.phrase || '';
		generateQRCode();
	}

	function copy(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		navigator.clipboard
			.writeText(phrase)
			.then(() => {
				copied = true;
				setTimeout(() => (copied = false), 1000);
			})
			.catch(err => console.error('Error while copying to clipboard', err));
	}

	function save() {
		name = name?.trim();
		const validationConfig = [{ field: name, element: elWalletNameInput, required: 'Wallet name is required' }];
		error = validateForm(validationConfig);
		if (error) return;
		// TODO: password protect the key
		if (mnemonic) addWallet(mnemonic, name);
		setSettingsSection('wallets');
	}

	function print() {
		// TODO: print preview and print
		const newWindow = window.open('', '_blank');
		if (!newWindow) {
			console.error('Failed to open print window');
			return;
		}
		newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QR Code</title>
      <style>
        .qr {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        .cell {
          padding: 5px;
          border: 1px solid #000;
        }
        table {
          margin: 20px auto;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
      <div>Use the following QR code to transfer your wallet seed phrase to your other device, never show it to anyone else!</div>
      <div class="qr"><img src="${qrCodeData}" alt="Seed phrase" /></div>
      <div>Write down or print these 24 words, also known as seed phrase. It will serve as a backup of your wallet. Cut it into 2 parts (12 + 12 words) and hide it in 2 different places, where you don't have your devices. Never show it to anyone else!</div>
      <table>
        <tr>
          <td>
            ${phrase
							.split(' ')
							.slice(0, 6)
							.map((word, index) => `<div class="cell">${index + 1}. ${word}</div>`)
							.join('')}
          </td>
          <td>
            ${phrase
							.split(' ')
							.slice(6, 12)
							.map((word, index) => `<div class="cell">${index + 7}. ${word}</div>`)
							.join('')}
          </td>
          <td>
            ${phrase
							.split(' ')
							.slice(12, 18)
							.map((word, index) => `<div class="cell">${index + 13}. ${word}</div>`)
							.join('')}
          </td>
          <td>
            ${phrase
							.split(' ')
							.slice(18, 24)
							.map((word, index) => `<div class="cell">${index + 19}. ${word}</div>`)
							.join('')}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `);
		newWindow.document.close();
		newWindow.print();
	}
</script>

<style>
	.info {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.phrase-wrapper {
		position: relative;
		display: inline-block;
		width: 100%;
	}

	.phrase {
		display: flex;
		text-align: justify;
		gap: 10px;
		border-radius: 10px;
		padding: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		transition: filter 0.3s ease;
	}

	.phrase.blurred {
		filter: blur(8px);
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
		width: 150px;
		height: 150px;
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
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.reveal-icon img {
		width: 20px;
		height: 20px;
		filter: invert(1);
	}
</style>

<Form onSubmit={save}>
	<Label text="Wallet name">
		<Input type="text" bind:value={name} bind:this={elWalletNameInput} />
	</Label>
</Form>
{#if error}
	<Alert type="error" message={error} />
{/if}
<Label text="Seed phrase">
	<div class="info">
		{#if !isRevealed}
			<Alert type="warning" message="Sensitive information is hidden. Click to reveal it." />
		{:else}
			<Alert type="info" message="Click to hide sensitive information." />
		{/if}
		<Clickable onClick={toggleReveal} aria-label={isRevealed ? 'Hide seed phrase' : 'Reveal seed phrase'}>
			<div class="phrase-wrapper">
				<div class="phrase" class:blurred={!isRevealed}>
					<span>{copied ? 'Copied!' : isRevealed ? phrase : dummyPhrase}</span>
					{#if !copied && isRevealed}
						<Icon img="img/copy.svg" colorVariable="--secondary-foreground" alt="Copy" size="20px" padding="5px" onClick={copy} />
					{/if}
				</div>
				{#if !isRevealed}
					<div class="reveal-icon" aria-hidden="true">
						<img src="img/show.svg" alt="Show" />
					</div>
				{/if}
			</div>
		</Clickable>
	</div>
</Label>
<div>Write down or print these 24 words, also known as seed phrase. It will serve as a backup of your wallet. Cut it into 2 parts (12 + 12 words) and hide it in 2 different places, where you don't have your devices. Never show it to anyone else!</div>
{#if qrCodeData && dummyQrCodeData}
	<div class="qr-wrapper">
		<Clickable onClick={toggleReveal} aria-label={isRevealed ? 'Hide QR code' : 'Reveal QR code'}>
			<img src={isRevealed ? qrCodeData : dummyQrCodeData} alt={isRevealed ? 'Seed phrase QR code' : 'Hidden QR code'} class="qr-image" class:blurred={!isRevealed} />
		</Clickable>
		{#if !isRevealed}
			<div class="reveal-icon" aria-hidden="true">
				<img src="img/show.svg" alt="Show" />
			</div>
		{/if}
	</div>
	<div>Use this QR code to transfer your wallet seed phrase to your other device, never show it to anyone else!</div>
{/if}
<ButtonBar expand>
	<Button img="img/save.svg" text="Save" onClick={save} />
	<Button img="modules/{module.identifier}/img/print.svg" text="Print" onClick={print} />
	<Button img="modules/{module.identifier}/img/regenerate.svg" text="Regenerate" onClick={regenerate} />
	<Button img="img/cancel.svg" text="Close" onClick={close} />
</ButtonBar>
