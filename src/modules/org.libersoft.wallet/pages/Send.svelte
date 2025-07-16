<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getEtherAmount, estimateTransactionFee, updateFeeFromLevel, feeLoading, transactionTimeLoading, feeLevel, fee, transactionTime, type IPayment, estimatedTransactionTimes, avgBlockTimeStore, confirmationBlocksStore } from '@/org.libersoft.wallet/scripts/transaction.ts';
	import { sendAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { selectedNetwork, currencies, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { validateForm, type FormValidatorConfig } from '@/core/scripts/utils/form.ts';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import { getBalance, getTokenBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
	import { formatEther } from 'ethers';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import DialogSend from '@/org.libersoft.wallet/dialogs/SendConfirmation.svelte';
	let currency: string | null | undefined = $state();
	let amount: string | number | undefined = $state();
	let error: string | null | undefined = $state();
	let elDialogSend: DialogSend | undefined = $state();
	let payment: IPayment | undefined = $state();
	let currentBalance: string | undefined = $state();
	let remainingBalance: string | undefined = $state();
	let remainingTokenBalance: string | undefined = $state();
	let remainingNativeBalance: string | undefined = $state();
	let nativeBalance: string | undefined = $state();
	let elAddressInput: Input | undefined = $state();
	let elCurrencyDropdown: DropdownFilter | undefined = $state();
	let elAmountInput: Input | undefined = $state();
	let elFeeInput: Input | undefined = $state();
	let selectedCurrencySymbol = $state(''); // Computed property to get the selected currency symbol
	let currencyForDropdown = $state(''); // Bidirectional binding helper for DropdownFilter

	// Sync currency changes to dropdown
	$effect(() => {
		currencyForDropdown = currency === undefined || currency === null ? '' : currency;
	});

	// Sync dropdown changes to currency
	$effect(() => {
		if (currencyForDropdown === '') currency = undefined;
		else currency = currencyForDropdown;
	});

	$effect(() => {
		if (currency === undefined || currency === null || currency === '') {
			selectedCurrencySymbol = '';
			return;
		}
		// If the selected currency is the network's native currency
		if (currency === $selectedNetwork?.currency?.symbol) {
			selectedCurrencySymbol = $selectedNetwork.currency.symbol;
			return;
		}
		// If it's a token, find the token and return its symbol
		const token = $tokens.find(t => t.symbol === currency);
		selectedCurrencySymbol = token?.symbol || currency;
	});

	$effect(() => {
		if ($provider && $selectedNetwork && $selectedAddress) {
			estimateTransactionFee();
			updateBalance();
		}
	});

	$effect(() => {
		// Update balance when currency changes
		currency;
		updateBalance();
	});

	$effect(() => {
		$feeLevel;
		updateFeeFromLevel();
	});

	$effect(() => {
		console.log('updateRemainingBalance effect triggered');
		updateRemainingBalance();
	});

	async function updateBalance() {
		/*
		write nativeBalance based on network's native currency
		write currentBalance based on selected currency
		*/

		try {
			/*if (currency === undefined || currency === null || currency === '') {
				currentBalance = undefined;
				nativeBalance = undefined;
				return;
			}*/
			// Always get native balance for fee calculation
			const nativeBalanceData = await getBalance();
			nativeBalance = nativeBalanceData?.amount || undefined;
			// If sending native currency
			if (currency === $selectedNetwork?.currency?.symbol) currentBalance = nativeBalance;
			else {
				// If sending token, get token balance
				if (currency) {
					const balance = await getTokenBalance(currency);
					currentBalance = balance?.amount || undefined;
				}
			}
		} catch (e) {
			console.error('Error updating balance:', e);
			currentBalance = undefined;
			nativeBalance = undefined;
		}
	}

	function updateRemainingBalance() {
		if (!currentBalance || !amount || !$fee || currency === undefined || currency === null || currency === '') {
			remainingBalance = undefined;
			remainingTokenBalance = undefined;
			remainingNativeBalance = undefined;
			return;
		}
		try {
			const balanceNative = parseFloat(currentBalance);
			const amountNative = parseFloat(amount.toString());
			const feeNative = parseFloat($fee.toString());
			if (isNaN(balanceNative) || isNaN(amountNative) || isNaN(feeNative)) {
				remainingBalance = undefined;
				remainingTokenBalance = undefined;
				remainingNativeBalance = undefined;
				return;
			}
			// If sending native currency
			if (currency === $selectedNetwork?.currency?.symbol) {
				const remaining = balanceNative - amountNative - feeNative;
				remainingBalance = remaining.toFixed(6);
				remainingTokenBalance = undefined;
				remainingNativeBalance = undefined;
			} else {
				// If sending token
				// Token balance: current token balance - amount sent
				const remainingToken = balanceNative - amountNative;
				remainingTokenBalance = remainingToken.toFixed(6);
				// Native balance: current native balance - fee
				if (nativeBalance) {
					const nativebalanceNative = parseFloat(nativeBalance);
					if (!isNaN(nativebalanceNative)) {
						const remainingNative = nativebalanceNative - feeNative;
						remainingNativeBalance = remainingNative.toFixed(6);
					} else remainingNativeBalance = `- ${feeNative.toFixed(6)}`;
				} else remainingNativeBalance = `- ${feeNative.toFixed(6)}`;
				remainingBalance = undefined;
			}
		} catch (e) {
			remainingBalance = undefined;
			remainingTokenBalance = undefined;
			remainingNativeBalance = undefined;
		}
	}

	async function setMaxAmount() {
		if (!currentBalance || !$fee) return;
		try {
			const balanceNative = parseFloat(currentBalance);
			const feeNative = parseFloat($fee.toString());
			if (isNaN(balanceNative) || isNaN(feeNative)) return;

			// If sending native currency, subtract fee from balance
			if (currency === $selectedNetwork?.currency?.symbol) {
				const maxAmount = balanceNative - feeNative;
				if (maxAmount > 0) amount = maxAmount.toFixed(6);
				else amount = '0';
			} else {
				// If sending token, use full token balance (fee is paid in native currency)
				amount = balanceNative.toFixed(6);
			}
		} catch (e) {
			console.error('Error setting max amount:', e);
		}
	}

	async function send() {
		error = null;
		// Validation config
		const validationConfig: FormValidatorConfig = [
			{
				field: $sendAddress,
				element: elAddressInput,
				required: 'Address is required',
			},
			{
				field: currency,
				element: elCurrencyDropdown,
				required: 'Currency is required',
			},
			{
				field: amount,
				element: elAmountInput,
				required: 'Amount is required',
				validate: value => {
					const etherAmount = getEtherAmount(value);
					if (!etherAmount) return 'Invalid amount';
					return null;
				},
			},
			{
				field: $fee,
				element: elFeeInput,
				required: 'Fee is required',
				validate: value => {
					const etherFee = getEtherAmount(value);
					if (!etherFee) return 'Invalid fee';
					return null;
				},
			},
		];
		// Validate form
		const validationError = validateForm(validationConfig);
		if (validationError) {
			error = validationError;
			return;
		}
		// If validation passes, create payment
		const etherAmount = getEtherAmount(amount);
		const etherFee = getEtherAmount($fee);
		payment = {
			address: $sendAddress!.toString(),
			amount: etherAmount!,
			fee: etherFee!,
			currency: currency,
		};
		elDialogSend?.open();
	}
</script>

<style>
	.send {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.fee {
		display: flex;
		gap: 10px;
		align-items: center;
		width: 100%;
	}

	.row {
		display: flex;
		gap: 10px;
		align-items: center;
		width: 100%;
	}
</style>

<div class="send">
	<Form onSubmit={send} width="400px">
		<Label text="Address">
			<Input bind:value={$sendAddress} bind:this={elAddressInput} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Currency">
			<DropdownFilter options={$currencies} bind:selected={currencyForDropdown} bind:this={elCurrencyDropdown} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Amount">
			<div class="row">
				<Input bind:value={amount} bind:this={elAmountInput} enabled={!!($selectedNetwork && $selectedAddress)} />
				{#if currency && currency !== ''}
					<div>{selectedCurrencySymbol}</div>
				{/if}
				<Button img="modules/{module.identifier}/img/maximum.svg" text="Max" enabled={!!($selectedNetwork && $selectedAddress && currentBalance && $fee)} onClick={setMaxAmount} />
			</div>
		</Label>
		<Label text="Transaction fee">
			<div class="fee">
				<Select bind:value={$feeLevel} enabled={!!($selectedNetwork && $selectedAddress)} minWidth="120px">
					<Option value="low" text="Low (slow)" />
					<Option value="average" text="Average" />
					<Option value="high" text="High (fast)" />
					<Option value="custom" text="Custom" />
				</Select>
				{#if $feeLevel === 'custom'}
					<Input bind:value={$fee} bind:this={elFeeInput} enabled={!!($selectedNetwork && $selectedAddress)} placeholder="Enter custom fee" />
					<div>{$selectedNetwork?.currency?.symbol || ''}</div>
				{:else if $feeLoading}
					<Spinner size="20px" />
				{:else}
					<Input bind:value={$fee} bind:this={elFeeInput} enabled={false} />
					<div>{$selectedNetwork?.currency?.symbol || ''}</div>
				{/if}
				{#if !$feeLoading && $feeLevel !== 'custom' && $provider && $selectedNetwork && $selectedAddress}
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="30px" padding="0" onClick={estimateTransactionFee} />
				{/if}
			</div>
		</Label>
		<Table>
			<Tbody>
				<Tr>
					<Td bold>Estimated transaction time:</Td>
					<Td>
						{#if $transactionTimeLoading}
							<Spinner size="12px" />
						{:else}
							{$transactionTime}
						{/if}
					</Td>
				</Tr>
				<Tr>
					<Td bold>Current balance:</Td>
					<Td>
						{#if currentBalance !== undefined && currency !== undefined && currency !== null && currency !== ''}
							{#if currency === $selectedNetwork?.currency?.symbol}
								<div>{currentBalance} {selectedCurrencySymbol}</div>
							{:else}
								<div>{currentBalance} {selectedCurrencySymbol}</div>
								{#if nativeBalance !== undefined}
									<div>{nativeBalance} {$selectedNetwork?.currency?.symbol || ''}</div>
								{:else}
									<Spinner size="12px" />
								{/if}
							{/if}
						{:else if currency !== undefined && currency !== null && currency !== ''}
							<Spinner size="12px" />
						{:else}
							<div>-</div>
						{/if}
					</Td>
				</Tr>
				<Tr>
					<Td bold>Balance after transaction:</Td>
					<Td>
						{#if currency === undefined || currency === null || currency === '' || !amount || amount === '' || amount === 0}
							<div>-</div>
						{:else if currency === $selectedNetwork?.currency?.symbol}
							{#if remainingBalance !== undefined}
								<div>{remainingBalance} {selectedCurrencySymbol}</div>
							{:else}
								<Spinner size="12px" />
							{/if}
						{:else if remainingTokenBalance !== undefined && remainingNativeBalance !== undefined}
							<div>{remainingTokenBalance} {selectedCurrencySymbol}</div>
							<div>{remainingNativeBalance} {$selectedNetwork?.currency?.symbol || ''}</div>
						{:else}
							<Spinner size="12px" />
						{/if}
					</Td>
				</Tr>
			</Tbody>
		</Table>
		{#if error}
			<Alert type="error" message={error} />
		{/if}
		<Button img="modules/{module.identifier}/img/send.svg" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={send} />
	</Form>
</div>
<DialogSend params={payment} bind:this={elDialogSend} />
{#if $debug}
	<div class="debug">
		estimatedTransactionTimes: {JSON.stringify($estimatedTransactionTimes)}
		<br />
		avgBlockTime: {JSON.stringify($avgBlockTimeStore)}
		<br />
		confirmationBlocks: {JSON.stringify($confirmationBlocksStore)}
		<br />
	</div>
{/if}
