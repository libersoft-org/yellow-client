<script lang="ts">
	//import { sendTransaction } from '../wallet.ts'
	import { module } from '../module.ts';
	import { playAudio } from '@/core/notifications.ts';
	//import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	//import Button from '@/core/components/Button/Button.svelte';
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

	async function send() {
		if (params) {
			//await sendTransaction(params.address, params.amount, params.fee, params.currency);
			playAudio('modules/' + module.identifier + '/audio/payment.mp3');
			if (close) close();
		}
	}
</script>

<!--

{#if params}
	<div>Would you really like to send this transaction?</div>
	<div>Address: <span class="bold">{params.address}</span></div>
	<div>Amount: <span class="bold">{params.amount} {params.currency}</span></div>
	<div>Transaction fee: <span class="bold">{params.fee}</span></div>
	<ButtonBar expand>
		<Button img="img/check.svg" text="Yes" onClick={send} />
		<Button img="img/cross.svg" text="Cancel" onClick={close} />
	</ButtonBar>
{/if}
-->
