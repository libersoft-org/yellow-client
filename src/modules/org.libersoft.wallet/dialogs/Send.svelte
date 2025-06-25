<script lang="ts">
	//import { sendTransaction } from '../wallet.ts'
	import { module } from '../module.ts';
	import { playAudio } from '@/core/notifications.ts';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	let elDialog;
	interface Props {
		params?: {
			address: string;
			amount: string;
			fee: string;
			currency: string;
		};
		close?: () => void;
	}
	let { params, close }: Props = $props();
	let dialogData = {
		title: 'Delete sticker database',
		body: body(),
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo },
		],
	};

	export function open() {
		elDialog?.open();
	}

	async function clickYes() {
		if (params) {
			//await sendTransaction(params.address, params.amount, params.fee, params.currency);
			playAudio('modules/' + module.identifier + '/audio/payment.mp3');
			if (close) close();
		}
	}

	function clickNo() {
		if (close) close();
	}
</script>

{#snippet body()}
	{#if params}
		<div>Would you really like to send this transaction?</div>
		<div>Address: <span class="bold">{params.address}</span></div>
		<div>Amount: <span class="bold">{params.amount} {params.currency}</span></div>
		<div>Transaction fee: <span class="bold">{params.fee}</span></div>
	{/if}
{/snippet}

<Dialog data={dialogData} bind:this={elDialog} />
