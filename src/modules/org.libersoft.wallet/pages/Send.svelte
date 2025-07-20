<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { getEtherAmount, estimateTransactionFee, updateFeeFromLevel, feeLoading, transactionTimeLoading, feeLevel, fee, transactionTime, type IPayment, estimatedTransactionTimes, avgBlockTimeStore, confirmationBlocksStore } from '@/org.libersoft.wallet/scripts/transaction.ts';
	import { type ICurrency } from '@/org.libersoft.wallet/scripts/network.ts';
	import { sendAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { selectedNetwork, currencies, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { validateForm, type FormValidatorConfig } from '@/core/scripts/utils/form.ts';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import { getBalance, getTokenBalanceByAddress, getBatchTokensInfo, type IBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
	import { formatUnits, parseUnits } from 'ethers';
	import BalanceDisplay from '@/org.libersoft.wallet/components/BalanceDisplay.svelte';
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
	let currency: ICurrency | null | undefined = $state();
	let amount: string | number | undefined = $state();
	let error: string | null | undefined = $state();
	let elDialogSend: DialogSend | undefined = $state();
	let payment: IPayment | undefined = $state();
	let currentBalanceData: IBalance | undefined = $state();
	let nativeBalanceData: IBalance | undefined = $state();
	let remainingBalance: bigint | undefined = $state();
	let remainingNativeBalance: bigint | undefined = $state();
	let remainingTokenBalance: bigint | undefined = $state();
	let remainingBalanceObj: IBalance | undefined = $derived.by(() => {
		return remainingBalance !== undefined ? { amount: remainingBalance, currency: $selectedNetwork?.currency?.symbol || '', decimals: 18 } : undefined;
	});
	let remainingNativeBalanceObj: IBalance | undefined = $derived.by(() => {
		return remainingNativeBalance !== undefined ? { amount: remainingNativeBalance, currency: $selectedNetwork?.currency?.symbol || '', decimals: 18 } : undefined;
	});
	let remainingTokenBalanceObj: IBalance | undefined = $derived.by(() => {
		return remainingTokenBalance !== undefined && currentBalanceData ? { amount: remainingTokenBalance, currency: currentBalanceData.currency, decimals: currentBalanceData.decimals } : undefined;
	});
	let elAddressInput: Input | undefined = $state();
	let elCurrencyDropdown: DropdownFilter | undefined = $state();
	let elAmountInput: Input | undefined = $state();
	let elFeeInput: Input | undefined = $state();
	let selectedCurrencySymbol = $state(''); // Computed property to get the selected currency symbol
	let tokenInfos = $state(new Map<string, { name: string; symbol: string }>());
	let isLoadingTokenInfos = $state(false);
	let currencyOptions = $derived.by(() => {
		return $currencies.map(currency => {
			let label = currency.symbol || 'Unknown';
			// For tokens with contract addresses, get proper name and symbol from tokenInfos
			if (currency.contract_address) {
				const tokenInfo = tokenInfos.get(currency.contract_address);
				if (tokenInfo && tokenInfo.symbol !== 'UNKNOWN') label = `${tokenInfo.name} (${tokenInfo.symbol})`;
				else if (tokenInfo?.name && tokenInfo.name !== 'Unknown Token') label = tokenInfo.name;
				else label = `Token (${currency.contract_address.slice(0, 8)}...)`;
			}
			return {
				label: label,
				icon: { img: currency.iconURL || 'modules/' + module.identifier + '/img/token.svg', size: '16px' },
				value: currency,
			};
		});
	});

	$effect(() => {
		if (!currency) {
			selectedCurrencySymbol = '';
			return;
		}
		// For tokens with contract addresses, get proper symbol from tokenInfos
		if (currency.contract_address) {
			const tokenInfo = tokenInfos.get(currency.contract_address);
			selectedCurrencySymbol = tokenInfo?.symbol && tokenInfo.symbol !== 'UNKNOWN' ? tokenInfo.symbol : 'UNKNOWN';
		} else {
			// Use the symbol from currency object for native currency
			selectedCurrencySymbol = currency?.symbol || '';
		}
	});

	$effect(() => {
		if ($provider && $selectedNetwork && $selectedAddress) {
			estimateTransactionFee(currency?.contract_address);
			updateBalance();
		}
	});

	$effect(() => {
		// Update balance when currency changes
		currency;
		updateBalance();
	});

	$effect(() => {
		// Update fee estimation when currency changes
		if ($provider && $selectedNetwork && $selectedAddress && currency) {
			estimateTransactionFee(currency?.contract_address);
		}
	});

	$effect(() => {
		$feeLevel;
		updateFeeFromLevel();
	});

	$effect(() => {
		console.log('updateRemainingBalance effect triggered');
		updateRemainingBalance();
	});

	// Watch for token changes and reload token infos
	$effect(() => {
		if ($tokens?.length) loadTokenInfos();
	});

	onMount(() => {
		elAddressInput?.focus();
		loadTokenInfos();
	});

	async function loadTokenInfos() {
		const tokensWithContracts = $tokens.filter(token => token.contract_address);
		if (!tokensWithContracts.length) return;
		isLoadingTokenInfos = true;
		try {
			const contractAddresses = tokensWithContracts.map(token => token.contract_address!);
			const batchResults = await getBatchTokensInfo(contractAddresses);
			// Save results to local map
			batchResults.forEach((tokenInfo, contractAddress) => {
				tokenInfos.set(contractAddress, { name: tokenInfo.name, symbol: tokenInfo.symbol });
			});
			// Trigger reactivity
			tokenInfos = new Map(tokenInfos);
		} catch (error) {
			console.error('Error loading token infos in Send:', error);
		} finally {
			isLoadingTokenInfos = false;
		}
	}

	async function updateBalance() {
		try {
			nativeBalanceData = (await getBalance()) || undefined;
			if (currency?.contract_address) currentBalanceData = (await getTokenBalanceByAddress(currency.contract_address)) || undefined;
			else if (currency) currentBalanceData = nativeBalanceData;
			else currentBalanceData = undefined;
		} catch (e) {
			console.error('Error updating balance:', e);
			currentBalanceData = undefined;
			nativeBalanceData = undefined;
		}
	}

	function updateRemainingBalance() {
		if (!currentBalanceData || !amount || !$fee || !currency) {
			remainingBalance = undefined;
			remainingTokenBalance = undefined;
			remainingNativeBalance = undefined;
			return;
		}
		try {
			const amountBigInt = parseUnits(amount.toString().replace(',', '.'), currentBalanceData.decimals || 18);
			const feeBigInt = parseUnits($fee.toString(), 18); // Fee is always in native currency (18 decimals)
			// If sending native currency
			if (!currency?.contract_address) {
				remainingBalance = currentBalanceData.amount - amountBigInt - feeBigInt;
				remainingTokenBalance = undefined;
				remainingNativeBalance = undefined;
			} else {
				// If sending token
				// Token balance: current token balance - amount sent
				remainingTokenBalance = currentBalanceData.amount - amountBigInt;
				// Native balance: current native balance - fee
				if (nativeBalanceData) remainingNativeBalance = nativeBalanceData.amount - feeBigInt;
				remainingBalance = undefined;
			}
		} catch (e) {
			remainingBalance = undefined;
			remainingTokenBalance = undefined;
			remainingNativeBalance = undefined;
		}
	}

	async function setMaxAmount() {
		if (!currentBalanceData || !$fee) return;
		try {
			const feeBigInt = parseUnits($fee.toString(), 18); // Fee is always in native currency (18 decimals)
			// If sending native currency, subtract fee from balance
			if (!currency?.contract_address) {
				let maxAmount = currentBalanceData.amount - feeBigInt;
				if (maxAmount < 0) maxAmount = 0n;
				amount = formatUnits(maxAmount, currentBalanceData.decimals || 18);
			} else {
				// If sending token, use full token balance (fee is paid in native currency)
				amount = formatUnits(currentBalanceData.amount, currentBalanceData.decimals || 18);
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
		let etherAmount: bigint;
		if (currency?.contract_address && currentBalanceData) {
			// For tokens, use the correct decimals
			etherAmount = parseUnits(amount!.toString().replace(',', '.'), currentBalanceData.decimals || 18);
		} else {
			// For native currency, use 18 decimals
			etherAmount = getEtherAmount(amount)!;
		}
		const etherFee = getEtherAmount($fee);
		payment = {
			address: $sendAddress!.toString(),
			amount: etherAmount,
			fee: etherFee!,
			symbol: currency?.symbol,
			contractAddress: currency?.contract_address,
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
			{#if isLoadingTokenInfos}
				<div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px;">
					<Spinner size="16px" />
				</div>
			{:else}
				<DropdownFilter options={currencyOptions} bind:selected={currency} bind:this={elCurrencyDropdown} enabled={!!($selectedNetwork && $selectedAddress)} />
			{/if}
		</Label>
		<Label text="Amount">
			<div class="row">
				<Input bind:value={amount} bind:this={elAmountInput} enabled={!!($selectedNetwork && $selectedAddress)} />
				{#if currency}
					<div>{selectedCurrencySymbol}</div>
				{/if}
				<Button img="modules/{module.identifier}/img/maximum.svg" text="Max" enabled={!!($selectedNetwork && $selectedAddress && currentBalanceData && $fee)} onClick={setMaxAmount} />
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
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="30px" padding="0" onClick={() => estimateTransactionFee(currency?.contract_address)} />
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
						{#if currentBalanceData && currency}
							<div><BalanceDisplay balance={currentBalanceData} showCurrency={false} /> {selectedCurrencySymbol}</div>
							{#if currency?.contract_address}
								{#if nativeBalanceData}
									<div><BalanceDisplay balance={nativeBalanceData} /></div>
								{:else}
									<Spinner size="12px" />
								{/if}
							{/if}
						{:else if currency}
							<Spinner size="12px" />
						{:else}
							<div>-</div>
						{/if}
					</Td>
				</Tr>
				<Tr>
					<Td bold>Balance after transaction:</Td>
					<Td>
						{#if !currency || !amount || amount === '' || amount === 0}
							<div>-</div>
						{:else if !currency?.contract_address}
							{#if remainingBalanceObj}
								<div><BalanceDisplay balance={remainingBalanceObj} showCurrency={false} /> {selectedCurrencySymbol}</div>
							{:else}
								<Spinner size="12px" />
							{/if}
						{:else if remainingTokenBalanceObj && remainingNativeBalanceObj}
							<div><BalanceDisplay balance={remainingTokenBalanceObj} showCurrency={false} /> {selectedCurrencySymbol}</div>
							<div><BalanceDisplay balance={remainingNativeBalanceObj} /></div>
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
		{#if $debug}
			<div class="debug">
				estimatedTransactionTimes: {JSON.stringify($estimatedTransactionTimes)}<br />
				avgBlockTime: {JSON.stringify($avgBlockTimeStore)}<br />
				confirmationBlocks: {JSON.stringify($confirmationBlocksStore)}
			</div>
		{/if}

		<Button img="modules/{module.identifier}/img/send.svg" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={send} />
	</Form>
</div>
<DialogSend params={payment} bind:this={elDialogSend} />
