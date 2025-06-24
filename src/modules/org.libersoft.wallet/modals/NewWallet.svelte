<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import { generateMnemonic, addWallet } from '../wallet.ts';
	import { module } from '../module.ts';
	export let close;
	let mnemonic = {};
	let phrase = '';
	let phraseArr = [];
	let qrCodeData = '';

	$: phraseArr = phrase.split(' ');

	onMount(() => {
		regenerate();
	});

	function generateQRCode() {
		QRCode.toDataURL(phrase, { width: 150 })
			.then(url => (qrCodeData = url))
			.catch(err => console.error(err));
	}

	function regenerate() {
		console.log('REGENERATE');
		mnemonic = generateMnemonic();
		phrase = mnemonic.phrase;
		generateQRCode();
	}

	function save() {
		// TODO: password protect the key
		console.log('SAVE');
		addWallet(mnemonic);
		close();
	}

	function print() {
		// TODO: print preview and print
		console.log('PRINT');
		const newWindow = window.open('', '_blank');
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
	.qr {
		display: flex;
		justify-content: center;
	}
</style>

{#if qrCodeData}
	<div>Use the following QR code to transfer your wallet seed phrase to your other device, never show it to anyone else!</div>
	<div class="qr"><img src={qrCodeData} alt="Seed phrase" /></div>
{/if}
<div>Write down or print these 24 words, also known as seed phrase. It will serve as a backup of your wallet. Cut it into 2 parts (12 + 12 words) and hide it in 2 different places, where you don't have your devices. Never show it to anyone else!</div>
<Table breakpoint="0">
	<Tbody>
		{#each Array(6) as _, index}
			<TbodyTr>
				<Td>{index + 1}. {phraseArr[index]}</Td>
				<Td>{index + 7}. {phraseArr[index + 6]}</Td>
				<Td>{index + 13}. {phraseArr[index + 12]}</Td>
				<Td>{index + 19}. {phraseArr[index + 18]}</Td>
			</TbodyTr>
		{/each}
	</Tbody>
</Table>
<ButtonBar expand>
	<Button img="img/save.svg" text="Save" onClick={save} />
	<Button img="modules/{module.identifier}/img/print.svg" text="Print" onClick={print} />
	<Button img="modules/{module.identifier}/img/regenerate.svg" text="Regenerate" onClick={regenerate} />
	<Button img="img/cancel.svg" text="Close" onClick={close} />
</ButtonBar>
