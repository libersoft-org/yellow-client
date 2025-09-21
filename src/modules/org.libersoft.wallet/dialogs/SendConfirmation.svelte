<script lang="ts">
	import { formatBalance, getTokenDecimals, getTokenInfo } from 'libersoft-crypto/balance';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { type IPayment, sendTransaction } from 'libersoft-crypto/transaction';
	import { transactionTime, transactionTimeLoading } from 'libersoft-crypto/transaction';
	import { playAudio } from '@/core/scripts/notifications.ts';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface Props {
		params?: IPayment;
		close?: () => void;
		onYes?: (params: any) => void;
	}
	let { params, close, onYes }: Props = $props();
	let elDialog;
	let tokenDecimals = $state<number | null>(null);
	let tokenInfo = $state<{ name: string; symbol: string } | null>(null);
	let loadingDecimals = $state(false);

	// Load decimals when params change
	$effect(() => {
		async function loadDecimals() {
			if (params?.contractAddress) {
				// Token transaction - get decimals and info from contract
				loadingDecimals = true;
				try {
					const [decimals, info] = await Promise.all([getTokenDecimals(params.contractAddress), getTokenInfo(params.contractAddress)]);
					tokenDecimals = decimals;
					tokenInfo = info;
				} finally {
					loadingDecimals = false;
				}
			} else {
				// Native currency transaction - always 18 decimals
				tokenDecimals = 18;
				tokenInfo = null;
				loadingDecimals = false;
			}
		}
		loadDecimals();
	});
	let dialogData = {
		title: 'Transaction confirmation',
		body: body,
		icon: 'modules/' + module.identifier + '/img/send.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true, testId: 'wallet-send-confirm-yes-btn' },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo, testId: 'wallet-send-confirm-no-btn' },
		],
	};

	export function open() {
		elDialog?.open();
	}

	async function clickYes() {
		if (!params) throw new Error('dialog missing params');
		onYes?.(params);
		elDialog?.close();
	}

	function clickNo() {
		elDialog?.close();
	}
</script>

{#snippet body()}
	{#if params}
		<div>Do you really want to send this transaction?</div>
		<br />
		<div>Address: <span class="bold">{params.address}</span></div>
		<div>
			Amount:
			{#if loadingDecimals}
				<Spinner size="12px" />
			{:else}
				{@const symbol = params.contractAddress ? tokenInfo?.symbol || 'UNKNOWN' : $selectedNetwork?.currency.symbol || ''}
				{@const correctDecimals = tokenDecimals || 18}
				{@const amountBalance = { amount: params.amount, currency: symbol, decimals: correctDecimals }}
				<span class="bold">{formatBalance(amountBalance)}</span>
			{/if}
		</div>
		<div>Transaction fee: <span class="bold">{formatBalance({ amount: params.fee, currency: $selectedNetwork?.currency.symbol || '', decimals: 18 })}</span></div>
		<div>
			Estimated time:
			{#if $transactionTimeLoading}
				<Spinner size="12px" />
			{:else}
				<span class="bold">{$transactionTime}</span>
			{/if}
		</div>
	{/if}
{/snippet}

<Dialog data={dialogData} bind:this={elDialog} />
