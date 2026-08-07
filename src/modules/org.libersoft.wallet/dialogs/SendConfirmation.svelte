<script lang="ts">
	import { formatBalance } from 'libersoft-crypto/balance';
	import { getTokenDecimals, getTokenInfo } from 'libersoft-crypto/tokens';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { type IPayment, type ITransactionFeeParams } from 'libersoft-crypto/transaction';
	import { transactionTime, transactionTimeLoading } from 'libersoft-crypto/transaction';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface Props {
		params?: IPayment | undefined;
		/** Decimals the caller will actually use to build the transaction. */
		signingDecimals?: number | undefined;
		/** Exact gas parameters that will be signed. */
		feeParams?: ITransactionFeeParams | undefined;
		close?: () => void;
		onYes?: (params: any) => void | Promise<void>;
	}
	let { params, signingDecimals, feeParams, close: _close, onYes }: Props = $props();
	let elDialog;
	let tokenDecimals = $state<number | null>(null);
	let tokenInfo = $state<{ name: string; symbol: string } | null>(null);
	let loadingDecimals = $state(false);
	let metadataError = $state<string | null>(null);
	let sending = $state(false);
	/* Metadata is loaded asynchronously; only the newest request may write to the dialog. Without
	 * this, a slow response for a previously selected token could describe the amount now shown. */
	let metadataGeneration = 0;

	// Load decimals when params change
	async function loadDecimals(): Promise<void> {
		const generation = ++metadataGeneration;
		/* Never show leftovers from the previous open. */
		tokenDecimals = null;
		tokenInfo = null;
		metadataError = null;
		const contractAddress = params?.contractAddress;
		const chainId = $selectedNetwork?.chainID;
		if (contractAddress) {
			// Token transaction - get decimals and info from contract
			loadingDecimals = true;
			try {
				const [decimals, info] = await Promise.all([getTokenDecimals(contractAddress), getTokenInfo(contractAddress)]);
				if (generation !== metadataGeneration || contractAddress !== params?.contractAddress || chainId !== $selectedNetwork?.chainID) return;
				if (decimals === null || decimals === undefined) {
					/* Guessing 18 here would show an amount that differs from the one being signed. */
					metadataError = 'Could not read the token decimals - the transaction cannot be confirmed.';
					return;
				}
				if (signingDecimals !== undefined && signingDecimals !== decimals) {
					/* The dialog would otherwise display a different amount than the one being signed. */
					metadataError = `Token decimals mismatch (contract reports ${decimals}, transaction would use ${signingDecimals}). The transaction cannot be confirmed.`;
					return;
				}
				tokenDecimals = decimals;
				tokenInfo = info;
			} catch (error) {
				if (generation !== metadataGeneration) return;
				console.error('Failed to load token metadata:', error);
				metadataError = 'Could not read the token metadata - the transaction cannot be confirmed.';
			} finally {
				if (generation === metadataGeneration) loadingDecimals = false;
			}
		} else {
			// Native currency transaction - always 18 decimals
			tokenDecimals = 18;
			tokenInfo = null;
			loadingDecimals = false;
		}
	}

	/* "Yes" stays disabled until the amount on screen is the amount that will be signed, and while a
	 * transaction is already being submitted - a second click used to start a second transaction. */
	let canConfirm = $derived(!!params && !loadingDecimals && !sending && !metadataError && tokenDecimals !== null);

	let dialogData = $derived({
		title: 'Transaction confirmation',
		body: body as any,
		icon: 'modules/' + module.identifier + '/img/send.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Yes', onClick: clickYes, focus: true, enabled: canConfirm, loading: sending, testId: 'wallet-send-confirm-yes-btn' },
			{ img: 'img/cross.svg', text: 'No', onClick: clickNo, enabled: !sending, testId: 'wallet-send-confirm-no-btn' },
		],
	});

	export function open(): void {
		sending = false;
		void loadDecimals();
		elDialog?.open();
	}

	async function clickYes(): Promise<void> {
		if (!params) throw new Error('dialog missing params');
		if (!canConfirm) return;
		sending = true;
		try {
			/* Wait for the transaction to be submitted before closing, so the dialog cannot be
			 * confirmed twice and the user sees when it actually went out. */
			await onYes?.(params);
			elDialog?.close();
		} finally {
			sending = false;
		}
	}

	function clickNo(): void {
		if (sending) return;
		elDialog?.close();
	}
</script>

<style>
	.error {
		color: var(--danger-foreground, #c00);
	}

	.raw {
		opacity: 0.7;
		font-size: 12px;
	}
</style>

{#snippet body()}
	{#if params}
		<div>Do you really want to send this transaction?</div>
		<br />
		<div>Address: <span class="bold">{params.address}</span></div>
		<div>
			Amount:
			{#if loadingDecimals}
				<Spinner size="12px" />
			{:else if tokenDecimals !== null}
				{@const symbol = params.contractAddress ? tokenInfo?.symbol || 'UNKNOWN' : $selectedNetwork?.currency.symbol || ''}
				{@const amountBalance = { amount: params.amount, currency: symbol, decimals: tokenDecimals }}
				<span class="bold">{formatBalance(amountBalance)}</span>
				<span class="raw">({params.amount} base units)</span>
			{:else}
				<span class="bold">unknown</span>
			{/if}
		</div>
		{#if params.contractAddress}
			<div>Token contract: <span class="bold">{params.contractAddress}</span></div>
		{/if}
		<div>Chain ID: <span class="bold">{$selectedNetwork?.chainID ?? 'unknown'}</span></div>
		<div>Maximum transaction fee: <span class="bold">{formatBalance({ amount: params.fee, currency: $selectedNetwork?.currency.symbol || '', decimals: 18 })}</span></div>
		{#if feeParams}
			<div class="raw">
				gas limit {feeParams.gasLimit}
				{#if feeParams.maxFeePerGas !== undefined}
					· max fee {feeParams.maxFeePerGas} wei/gas · priority {feeParams.maxPriorityFeePerGas ?? feeParams.maxFeePerGas} wei/gas
				{:else if feeParams.gasPrice !== undefined}
					· gas price {feeParams.gasPrice} wei/gas
				{/if}
			</div>
		{/if}
		<div>
			Estimated time:
			{#if $transactionTimeLoading}
				<Spinner size="12px" />
			{:else}
				<span class="bold">{$transactionTime}</span>
			{/if}
		</div>
		{#if metadataError}
			<br />
			<div class="error">{metadataError}</div>
		{/if}
	{/if}
{/snippet}

<Dialog data={dialogData} bind:this={elDialog} />
