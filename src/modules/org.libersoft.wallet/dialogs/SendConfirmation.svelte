<script lang="ts">
	import { formatUnits } from 'ethers';
	//import { sendTransaction } from '@/org.libersoft.wallet/scripts/transaction.ts'
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
	import { type IPayment } from '@/org.libersoft.wallet/scripts/transaction.ts';
	import { playAudio } from '@/core/scripts/notifications.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	interface Props {
		params?: IPayment;
		close?: () => void;
	}
	let { params, close }: Props = $props();
	let elDialog;
	let dialogData = {
		title: 'Transaction confirmation',
		body: body,
		icon: 'img/del.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true },
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
			elDialog?.close();
		}
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

{#snippet body()}
	{#if params}
		<div>Would you really like to send this transaction?</div>
		<div>Address: <span class="bold">{params.address}</span></div>
		<div>Amount: <span class="bold">{formatUnits(params.amount, 18)} {params.currency}</span></div>
		<div>Transaction fee: <span class="bold">{formatUnits(params.fee, 18)} {$selectedNetwork?.currency.symbol || ''}</span></div>
	{/if}
{/snippet}

<Dialog data={dialogData} bind:this={elDialog} />
