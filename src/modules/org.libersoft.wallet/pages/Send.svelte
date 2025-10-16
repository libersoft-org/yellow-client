<script lang="ts">
	import { onMount } from 'svelte';
	import { debug } from '@/core/scripts/stores.ts';
	import { getEtherAmount, estimateTransactionFee, updateFeeFromLevel, feeLoading, transactionTimeLoading, feeLevel, fee, transactionTime, type IPayment, estimatedTransactionTimes, avgBlockTimeStore, confirmationBlocksStore, sendTransaction, logTransaction } from 'libersoft-crypto/transaction';
	import { sendAddress, sendCurrency } from 'libersoft-crypto/wallet';
	import { selectedNetwork, selectedNetworkID, networks, type ICurrency } from 'libersoft-crypto/network';
	import { currencies } from 'libersoft-crypto/currencies';
	import { tokenInfos } from 'libersoft-crypto/tokens';
	import { selectedAddress } from 'libersoft-crypto/wallet';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { validateForm, type FormValidatorConfig } from '@/core/scripts/utils/form.ts';
	import { provider } from 'libersoft-crypto/provider';
	import { getBalance, formatBalance, type IBalance } from 'libersoft-crypto/balance';
	import { getTokenBalanceByAddress, getBatchTokensInfo } from 'libersoft-crypto/tokens';
	import { formatUnits, parseUnits } from 'ethers';
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
	import QRScanner from '@/core/components/QRScanner/QRScanner.svelte';
	import { parseQRData } from '@/org.libersoft.wallet/scripts/payment-qr.ts';
	import { ensureWalletConnection, networksWindow, settingsWindow, setSection } from '@/org.libersoft.wallet/scripts/ui';
	import { playAudio } from '@/core/scripts/notifications.ts';
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
	let showQRScanner = $state(false);
	let qrError: string | null = $state(null);
	let qrChainID: number | null = $state(null);
	let qrContractAddress: string | null = $state(null);
	let selectedCurrencySymbol = $state(''); // Computed property to get the selected currency symbol

	// Track subscriptions for cleanup
	let networkUnsubscribe: (() => void) | null = null;
	let addressUnsubscribe: (() => void) | null = null;
	let feeLevelUnsubscribe: (() => void) | null = null;
	let isInitialized = $state(false);
	let currencyOptions = $state<Array<{ label: string; icon: { img: string; size: string }; value: ICurrency }>>([]);

	// Function to update currency options
	function updateCurrencyOptions() {
		currencyOptions = $currencies.map(currency => {
			let label = currency.symbol || 'Unknown';
			// For tokens with contract addresses, get proper name and symbol from tokenInfos
			if (currency.contract_address) {
				const tokenInfo = $tokenInfos.get(currency.contract_address);
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
	}

	// Helper function for handling network changes - reload currencies and data
	function handleNetworkChange(newNetwork: typeof $selectedNetwork, currentNetwork: typeof $selectedNetwork) {
		// Only reset if the actual network (not just RPC) changed - compare by network GUID
		const networkChanged = newNetwork?.guid !== currentNetwork?.guid;
		if (isInitialized && networkChanged) {
			console.log('Send: Network changed - reloading data');
			// Reset state and reload data
			currency = null;
			error = null;
			currentBalanceData = undefined;
			nativeBalanceData = undefined;
			updateBalance();
			updateCurrencyOptions(); // Update currency options on network change
			// Estimate transaction fee for new network only on actual network change
			if ($provider && $selectedNetwork && $selectedAddress) {
				console.log('Send: Estimating fee due to network change');
				estimateFeeWithLogging((currency as any)?.contract_address, 'network change');
			}
		}
	}

	// Helper function for handling address changes
	function handleAddressChange(newAddress: typeof $selectedAddress, currentAddress: typeof $selectedAddress) {
		if (isInitialized && newAddress !== currentAddress) {
			console.log('Send: Address changed - reloading balance');
			// Update balance for new address, but don't recalculate fee
			updateBalance();
		}
	}

	// Track current currency to detect actual changes
	let oldCurrency: ICurrency | null | undefined = undefined;
	let oldAmount: string | number | undefined = undefined;

	// Helper function for handling currency changes
	function handleCurrencyChange() {
		//console.log('Send: handleCurrencyChange called. Current currency:', oldCurrency, 'New currency:', currency);
		//console.log('(oldCurrency !== currency):', oldCurrency !== currency);

		// Only proceed if currency actually changed

		const c = $state.snapshot(currency);

		//console.log('Send: handleCurrencyChange called. Current currency:', oldCurrency, 'New currency:', c);

		if (oldCurrency !== c) {
			console.log('(oldCurrency !== currency):', oldCurrency !== c);

			if (isInitialized && c) {
				console.log('Send: Currency changed - updating balance and fee');
				updateBalance();
				if ($provider && $selectedNetwork && $selectedAddress) {
					console.log('Send: Estimating fee due to currency change');
					estimateFeeWithLogging(c?.contract_address, 'currency change');
				}
			}
			oldCurrency = c;
		}

		console.log('Send: Updating selectedCurrencySymbol due to currency change');
		updateCurrencySymbol();
		console.log('Send: selectedCurrencySymbol is now:', $state.snapshot(selectedCurrencySymbol));
	}

	// Helper function for updating currency symbol
	function updateCurrencySymbol() {
		if (!currency) {
			selectedCurrencySymbol = '';
			return;
		}
		// For tokens with contract addresses, get proper symbol from tokenInfos
		if (currency.contract_address) {
			const tokenInfo = $tokenInfos.get(currency.contract_address);
			selectedCurrencySymbol = tokenInfo?.symbol && tokenInfo.symbol !== 'UNKNOWN' ? tokenInfo.symbol : 'UNKNOWN';
		} else {
			// Use the symbol from currency object for native currency
			selectedCurrencySymbol = currency?.symbol || '';
		}
	}

	// Helper function for handling fee level changes
	function handleFeeLevelChange() {
		if (isInitialized) {
			updateFeeFromLevel();
		}
	}

	// Helper function for handling amount changes
	function handleAmountChange() {
		// Only proceed if amount actually changed
		if (oldAmount !== amount) {
			if (isInitialized) {
				updateRemainingBalance();
			}
			oldAmount = amount;
		}
	}

	// Wrapper for estimateTransactionFee with logging
	function estimateFeeWithLogging(contractAddress: string | undefined, reason: string) {
		console.log(`Send: Estimating transaction fee - ${reason}`);
		estimateTransactionFee(contractAddress);
	}

	onMount(() => {
		elAddressInput?.focus();

		const preSelectedCurrency = $sendCurrency;
		if (preSelectedCurrency) {
			const matchingCurrency = $currencies.find(c => $state.snapshot(c.symbol) === preSelectedCurrency);
			//console.log('Matching currency:', matchingCurrency);
			if (matchingCurrency) {
				//				console.log('Send: Setting pre-selected currency:', matchingCurrency);
				currency = matchingCurrency;
				//console.log('Send: Currency after setting pre-selected:', currency);
				handleCurrencyChange();
			}
			// Clear the sendCurrency after using it
			sendCurrency.set(null);
		}

		// Set up subscriptions to watch for network and address changes
		let currentNetworkGuid = $selectedNetwork?.guid;
		let currentAddress = $selectedAddress;
		let currentFeeLevel = $feeLevel;
		oldCurrency = currency; // Initialize current currency tracking
		oldAmount = amount; // Initialize current amount tracking
		// Subscribe to network changes - track only GUID changes, not entire object
		networkUnsubscribe = selectedNetwork.subscribe(newNetwork => {
			const newNetworkGuid = newNetwork?.guid;
			if (currentNetworkGuid !== newNetworkGuid) {
				// Create minimal network objects for the handler
				const currentNetworkObj = { guid: currentNetworkGuid };
				const newNetworkObj = { guid: newNetworkGuid };
				handleNetworkChange(newNetworkObj as any, currentNetworkObj as any);
				currentNetworkGuid = newNetworkGuid;
			}
		});

		// Subscribe to address changes
		addressUnsubscribe = selectedAddress.subscribe(newAddress => {
			handleAddressChange(newAddress, currentAddress);
			currentAddress = newAddress;
		});

		// Subscribe to fee level changes
		feeLevelUnsubscribe = feeLevel.subscribe(newFeeLevel => {
			if (isInitialized && newFeeLevel !== currentFeeLevel) {
				handleFeeLevelChange();
				currentFeeLevel = newFeeLevel;
			}
		});

		const tokenInfosUnsubscribe = tokenInfos.subscribe(() => {
			// When tokenInfos update, refresh currency options to get updated names/symbols
			updateCurrencyOptions();
		});

		isInitialized = true; // Mark as initialized to enable reactive effects

		return () => {
			// Cleanup on destroy
			if (networkUnsubscribe) networkUnsubscribe();
			if (addressUnsubscribe) addressUnsubscribe();
			if (feeLevelUnsubscribe) feeLevelUnsubscribe();
			if (tokenInfosUnsubscribe) tokenInfosUnsubscribe();
		};
	});

	function scanQRCode() {
		showQRScanner = !showQRScanner;
		if (showQRScanner) {
			qrError = null; // Clear any previous errors when opening scanner
		}
	}

	function handleQRScanned(data: string) {
		const parsed = parseQRData(data);

		if (parsed.error) {
			qrError = parsed.error;
			return;
		}

		qrChainID = parsed.chainID || null;
		qrContractAddress = parsed.contractAddress || null;

		if (parsed.address) {
			$sendAddress = parsed.address;
		}

		if (parsed.amount) {
			amount = parsed.amount;
		}

		// Handle currency selection from QR data
		if (!qrContractAddress) {
			// Native currency
			const matchingOption = $state.snapshot(currencyOptions).find(opt => !opt.value.contract_address);
			currency = matchingOption?.value;
			handleCurrencyChange();
		} else if (qrCurrency) {
			// Token QR: qrCurrency reactively found the token by contract address
			const matchingOption = $state.snapshot(currencyOptions).find(opt => opt.value.contract_address === $state.snapshot(qrCurrency.contract_address));
			currency = matchingOption?.value || qrCurrency;
			handleCurrencyChange();
		} else if (parsed.contractAddress) {
			// Token QR but token not found in current network - clear currency
			console.log("QR has a token but it's not found in current network - clear currency");
			currency = null;
		}

		showQRScanner = false;
		qrError = null;
	}

	function switchToQRNetwork() {
		if (qrNetwork) {
			// Switch to the existing network
			console.log('Switching to network:', qrNetwork.name, 'Chain ID:', qrNetwork.chainID);
			$selectedNetworkID = qrNetwork.guid ?? null;
		} else {
			// Network not found, open manage networks
			manageNetworks();
		}
	}

	function manageNetworks() {
		$networksWindow?.open();
	}

	function addQRToken() {
		if (qrContractAddress && $selectedNetwork?.guid) {
			$settingsWindow?.open();
			$settingsWindow?.setSettingsSection(`networks-tokens-add-${$selectedNetwork.guid}`, { contractAddress: qrContractAddress });
		}
	}

	// Computed property to check if network matches
	let networkMatches = $derived(qrChainID === null || $state.snapshot($selectedNetwork?.chainID) === $state.snapshot(qrChainID));

	// currency object based on qrContractAddress and $currencies
	let qrCurrency: ICurrency | undefined = $derived($state.snapshot(qrContractAddress) ? $state.snapshot($currencies).find(c => c.contract_address === $state.snapshot(qrContractAddress)) : undefined);

	let needsTokenAdd = $derived(qrContractAddress && !qrCurrency && networkMatches);

	// Find the network that matches the QR chain ID
	let qrNetwork = $derived(qrChainID ? $networks.find(n => $state.snapshot(n.chainID) === $state.snapshot(qrChainID)) : undefined);

	// Check if we have the network configured
	let hasQRNetwork = $derived(!!qrNetwork);

	function handleQRError(error: string) {
		qrError = error;
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
			etherAmount = getEtherAmount(amount || 0)!;
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

	async function onYes(params: any) {
		console.log('ONYES - awaiting ensureWalletConnection...');
		if (await ensureWalletConnection()) {
			console.log('ensureWalletConnection passed, sending transaction...');

			try {
				const hash = await sendTransaction(params.address, params.amount, params.fee, params.contractAddress, selectedCurrencySymbol, currentBalanceData?.decimals);

				console.log('Transaction sent, hash:', hash);

				playAudio('modules/' + module.identifier + '/audio/payment.mp3');

				// Reset form after successful transaction
				$sendAddress = '';
				amount = '';
				currency = null;
				error = null;

				// Navigate to History section
				setSection('history');
			} catch (err) {
				console.error('Transaction failed:', err);
				error = err instanceof Error ? err.message : 'Transaction failed';
			}
		}
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

	.qr-scanner-container {
		width: 100%;
		max-width: 400px;
		margin: 20px 0;
	}
</style>

<div class="send">
	<Button img="img/qr.svg" text={showQRScanner ? 'Hide QR Scanner' : 'Scan QR code'} onClick={scanQRCode} data-testid="wallet-send-scan-qr-btn" />
	{#if showQRScanner}
		<div class="qr-scanner-container">
			<QRScanner onScanned={handleQRScanned} onError={handleQRError} instructions="Point your camera at a QR code containing an address" testId="wallet-send-qr-scanner" autoStart={true} />
		</div>
		{#if qrError}
			<Alert type="error" message={qrError} />
		{/if}
	{/if}
	{#if !networkMatches && qrChainID}
		{#if hasQRNetwork}
			<Alert type="warning" message="QR code is for {qrNetwork?.name} (Chain {qrChainID}), but current network is {$selectedNetwork?.name} (Chain {$selectedNetwork?.chainID}). Switch networks to proceed." />
			<Button img="modules/{module.identifier}/img/network.svg" text="Switch to {qrNetwork?.name}" onClick={switchToQRNetwork} data-testid="wallet-send-switch-network-btn" />
		{:else}
			<Alert type="warning" message="QR code is for Chain {qrChainID}, but this network is not configured. Add the network to proceed." />
			<Button img="modules/{module.identifier}/img/network.svg" text="Manage Networks" onClick={manageNetworks} data-testid="wallet-send-manage-networks-btn" />
		{/if}
	{/if}
	{#if needsTokenAdd}
		<Alert type="info" message="Token {qrContractAddress} is not available in current network. Add it to enable sending." />
		<Button img="modules/{module.identifier}/img/token.svg" text="Add Token" onClick={addQRToken} data-testid="wallet-send-add-token-btn" />
	{/if}
	<Form onSubmit={send} width="400px">
		<Label text="Address">
			<Input bind:value={$sendAddress} bind:this={elAddressInput} enabled={!!($selectedNetwork && $selectedAddress)} data-testid="wallet-send-address-input" />
		</Label>
		<Label text="Currency">
			{#if $debug}currency:{JSON.stringify(currency)}{/if}
			<DropdownFilter options={currencyOptions} bind:selected={currency} bind:this={elCurrencyDropdown} enabled={!!($selectedNetwork && $selectedAddress)} onChange={handleCurrencyChange} data-testid="wallet-send-currency-dropdown" />
		</Label>
		<Label text="Amount">
			<div class="row">
				<Input bind:value={amount} bind:this={elAmountInput} enabled={!!($selectedNetwork && $selectedAddress)} onChange={handleAmountChange} data-testid="wallet-send-amount-input" />
				{#if currency}
					<div>{selectedCurrencySymbol}</div>
				{/if}
				<Button img="modules/{module.identifier}/img/maximum.svg" text="Max" enabled={!!($selectedNetwork && $selectedAddress && currentBalanceData && $fee)} onClick={setMaxAmount} data-testid="wallet-send-max-btn" />
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
					<Input bind:value={$fee} bind:this={elFeeInput} enabled={!!($selectedNetwork && $selectedAddress)} placeholder="Enter custom fee" data-testid="wallet-send-fee-input" />
					<div>{$selectedNetwork?.currency?.symbol || ''}</div>
				{:else if $feeLoading}
					<Spinner size="20px" />
				{:else}
					<Input bind:value={$fee} bind:this={elFeeInput} enabled={false} data-testid="wallet-send-fee-input" />
					<div>{$selectedNetwork?.currency?.symbol || ''}</div>
				{/if}
				{#if !$feeLoading && $feeLevel !== 'custom' && $provider && $selectedNetwork && $selectedAddress}
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="30px" padding="0" onClick={() => estimateFeeWithLogging(currency?.contract_address, 'manual refresh')} />
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
							<div>{formatBalance(currentBalanceData)}</div>
							{#if currency?.contract_address}
								{#if nativeBalanceData}
									<div>{formatBalance(nativeBalanceData)}</div>
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
								<div>{formatBalance(remainingBalanceObj)}</div>
							{:else}
								<Spinner size="12px" />
							{/if}
						{:else if remainingTokenBalanceObj && remainingNativeBalanceObj}
							<div>{formatBalance(remainingTokenBalanceObj)}</div>
							<div>{formatBalance(remainingNativeBalanceObj)}</div>
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
		<Button img="modules/{module.identifier}/img/send.svg" text="Send" enabled={!!($selectedNetwork && $selectedAddress && networkMatches)} onClick={send} data-testid="wallet-send-submit-btn" />
	</Form>
</div>
<DialogSend params={payment} bind:this={elDialogSend} {onYes} />
