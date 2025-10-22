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
	import { formatBalance } from 'libersoft-crypto/balance';
	import { nativeBalance } from 'libersoft-crypto/native';
	import type { IBalance } from 'libersoft-crypto/types';
	import { getBatchTokensInfo, tokenBalances } from 'libersoft-crypto/tokens';
	import { nftBalances, nftBalanceKey } from 'libersoft-crypto/nfts';
	import { isValidContractAddress } from 'libersoft-crypto/address-validation';
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

	let isInitialized = $state(false);
	let showQRScanner = $state(false);
	let currency: ICurrency | null | undefined = $state();
	let amount: string | number | undefined = $state();
	let error: string | null | undefined = $state();
	let errorHint: string | null | undefined = $state();
	let elDialogSend: DialogSend | undefined = $state();
	let payment: IPayment | undefined = $state();

	let currentBalanceData: IBalance | undefined = $derived.by(() => {
		if (!currency) return undefined;

		if (currency.type === 'native') {
			return nativeBalanceData;
		} else if (currency.type === 'token') {
			const tokenBalance = $tokenBalances.get(currency.contract_address);
			return tokenBalance?.crypto;
		} else if (currency.type === 'nft') {
			const key = nftBalanceKey(currency.contract_address, currency.tokenId);
			const nftBalance = $nftBalances.get(key);
			if (nftBalance) {
				return {
					amount: BigInt(nftBalance.amount),
					currency: currency.symbol,
					decimals: 0,
				};
			}
		}
		return undefined;
	});

	// Reactive native balance data from store
	let nativeBalanceData: IBalance | undefined = $derived($nativeBalance?.crypto);
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

	let qrError: string | null = $state(null);
	let qrChainID: number | null = $state(null);
	let qrContractAddress: string | null = $state(null);

	let currencyOptions = $state<Array<{ label: string; icon: { img: string; size: string }; value: ICurrency }>>([]);

	let selectedCurrencySymbol = $derived.by(() => {
		if (!currency) return '';

		if (currency.type === 'token') {
			const tokenInfo = $tokenInfos.get(currency.contract_address);
			return tokenInfo?.symbol || 'UNKNOWN';
		} else if (currency.type === 'nft') {
			return currency.symbol;
		} else {
			return currency?.symbol || '';
		}
	});

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
		let currentNetwork = $selectedNetworkID;
		let currentAddress = $selectedAddress;
		let currentFeeLevel = $feeLevel;
		oldCurrency = currency; // Initialize current currency tracking
		oldAmount = amount; // Initialize current amount tracking

		// Subscribe to network changes - track only GUID changes, not entire object
		const networkUnsubscribe = selectedNetworkID.subscribe(newNetwork => {
			if (currentNetwork !== newNetwork) {
				handleNetworkChange(newNetwork, currentNetwork);
				currentNetwork = newNetwork;
			}
		});

		// Subscribe to address changes
		const addressUnsubscribe = selectedAddress.subscribe(newAddress => {
			handleAddressChange(newAddress, currentAddress);
			currentAddress = newAddress;
		});

		// Subscribe to fee level changes
		const feeLevelUnsubscribe = feeLevel.subscribe(newFeeLevel => {
			if (isInitialized && newFeeLevel !== currentFeeLevel) {
				handleFeeLevelChange();
				currentFeeLevel = newFeeLevel;
			}
		});

		const currenciesUnsubscribe = currencies.subscribe(() => {
			updateCurrencyOptions();
		});

		isInitialized = true; // Mark as initialized to enable reactive effects

		return () => {
			// Cleanup on destroy
			if (networkUnsubscribe) networkUnsubscribe();
			if (addressUnsubscribe) addressUnsubscribe();
			if (feeLevelUnsubscribe) feeLevelUnsubscribe();
			if (currenciesUnsubscribe) currenciesUnsubscribe();
		};
	});

	// Function to update currency options based on 'libersoft-crypto/currencies'
	function updateCurrencyOptions() {
		currencyOptions = $currencies.map(currency => {
			let label = currency.symbol || 'Unknown';
			// For tokens with contract addresses, get proper name and symbol from tokenInfos
			if (currency.type === 'token') {
				const tokenInfo = $tokenInfos.get(currency.contract_address);
				if (tokenInfo && tokenInfo.symbol !== 'UNKNOWN') label = `${tokenInfo.name} (${tokenInfo.symbol})`;
				else if (tokenInfo?.name && tokenInfo.name !== 'Unknown Token') label = tokenInfo.name;
				else label = `Token (${currency.contract_address.slice(0, 8)}...)`;
			} else if (currency.type === 'nft') {
				// Handle missing NFT metadata gracefully
				if (currency.symbol && currency.symbol.trim()) {
					label = `${currency.symbol} (NFT)`;
				} else {
					// Fallback to contract address and token ID for identification
					const shortContract = currency.contract_address.slice(0, 8);
					const shortTokenId = currency.tokenId.length > 8 ? currency.tokenId.slice(0, 8) + '...' : currency.tokenId;
					label = `NFT ${shortContract}...#${shortTokenId}`;
				}
			}
			return {
				label: label,
				icon: {
					img: currency.iconURL || (currency.type === 'nft' ? 'modules/' + module.identifier + '/img/nft.svg' : 'modules/' + module.identifier + '/img/token.svg'),
					size: '16px',
				},
				value: currency,
			};
		});
	}

	// Helper function for handling network changes - reload currencies and data // uhh
	function handleNetworkChange(newNetwork, currentNetwork) {
		const networkChanged = newNetwork !== currentNetwork;
		if (isInitialized && networkChanged) {
			console.log('Send: Network switched - reloading data');

			// Reset state - balance data will update reactively
			currency = null;
			error = null;
		}
	}

	// Helper function for handling address changes
	function handleAddressChange(newAddress: typeof $selectedAddress, currentAddress: typeof $selectedAddress) {
		if (isInitialized && newAddress !== currentAddress) {
			console.log('Send: Address changed - balance will update reactively');
			// Balance data will update reactively through stores
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
				console.log('Send: Currency changed - balance will update reactively, estimating fee');
				// Balance data will update reactively through derived currentBalanceData
				if ($provider && $selectedNetwork && $selectedAddress) {
					console.log('Send: Estimating fee due to currency change');
					const contractAddress = c?.type === 'token' || c?.type === 'nft' ? c.contract_address : undefined;
					estimateFeeWithLogging(contractAddress, 'currency change');
				}
			}
			oldCurrency = c;
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

	// debug wrapper for estimateTransactionFee
	function estimateFeeWithLogging(contractAddress: string | undefined, reason: string) {
		console.log(`Send: Estimating transaction fee - ${reason}`);
		if (currency?.type === 'nft') {
			estimateTransactionFee(contractAddress, currency.tokenId, currency.standard);
		} else {
			estimateTransactionFee(contractAddress);
		}
	}

	// Validate NFT ownership and amount
	function validateNftTransaction(): string | null {
		if (currency?.type !== 'nft' || !amount) return null;

		// Validate contract address
		if (!isValidContractAddress(currency.contract_address)) {
			return 'Invalid NFT contract address';
		}

		// Use BigInt for safe parsing of potentially large amounts
		let amountBigInt: bigint;
		try {
			const amountStr = amount.toString().trim();
			// Check for decimal places (NFTs must be whole numbers)
			if (amountStr.includes('.') || amountStr.includes(',')) {
				return 'NFT amount must be a whole number (no decimals)';
			}
			amountBigInt = BigInt(amountStr);
			if (amountBigInt <= 0n) {
				return 'NFT amount must be greater than 0';
			}
		} catch (error) {
			return 'NFT amount must be a valid positive integer';
		}

		// Check if user owns enough NFTs
		if (currentBalanceData && currentBalanceData.amount < amountBigInt) {
			return `Insufficient NFT balance. You own ${currentBalanceData.amount.toString()} but trying to send ${amountBigInt.toString()}`;
		}

		// ERC-721 specific validation
		if (currency.standard === 'ERC721' && amountBigInt !== 1n) {
			return 'ERC-721 NFTs can only be sent one at a time (amount must be 1)';
		}

		return null; // Valid
	}

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
			const matchingOption = $state.snapshot(currencyOptions).find(opt => opt.value.type === 'native');
			currency = matchingOption?.value;
			handleCurrencyChange();
		} else if (qrCurrency) {
			// Token QR: qrCurrency reactively found the token by contract address
			const qrCurrencySnapshot = $state.snapshot(qrCurrency);
			const qrContractAddr = qrCurrencySnapshot.type === 'token' || qrCurrencySnapshot.type === 'nft' ? qrCurrencySnapshot.contract_address : undefined;
			const matchingOption = $state.snapshot(currencyOptions).find(opt => (opt.value.type === 'token' || opt.value.type === 'nft') && opt.value.contract_address === qrContractAddr);
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

	function handleQRError(error: string) {
		qrError = error;
	}

	// Find the network that matches the QR chain ID
	let qrNetwork = $derived(qrChainID ? $networks.find(n => $state.snapshot(n.chainID) === $state.snapshot(qrChainID)) : undefined);

	// Check if we have the network configured
	let hasQRNetwork = $derived(!!qrNetwork);

	// Computed property to check if QR network matches
	let networkMatches = $derived(qrChainID === null || $state.snapshot($selectedNetwork?.chainID) === $state.snapshot(qrChainID));

	// currency object based on qrContractAddress and $currencies
	let qrCurrency: ICurrency | undefined = $derived($state.snapshot(qrContractAddress) ? $state.snapshot($currencies).find(c => (c.type === 'token' || c.type === 'nft') && c.contract_address === $state.snapshot(qrContractAddress)) : undefined);

	let needsTokenAdd = $derived(qrContractAddress && !qrCurrency && networkMatches);

	function updateRemainingBalance() {
		if (!currentBalanceData || !amount || !$fee || !currency) {
			remainingBalance = undefined;
			remainingTokenBalance = undefined;
			remainingNativeBalance = undefined;
			return;
		}
		try {
			let amountBigInt: bigint;
			if (currency?.type === 'nft') {
				// For NFTs, always use whole numbers (0 decimals) - use BigInt directly for safety
				amountBigInt = BigInt(amount.toString().trim());
			} else {
				// For tokens and native currency, use proper decimals
				amountBigInt = parseUnits(amount.toString().replace(',', '.'), currentBalanceData.decimals || 18);
			}
			const feeBigInt = parseUnits($fee.toString(), 18); // Fee is always in native currency (18 decimals)
			// If sending native currency
			if (currency?.type === 'native') {
				remainingBalance = currentBalanceData.amount - amountBigInt - feeBigInt;
				remainingTokenBalance = undefined;
				remainingNativeBalance = undefined;
			} else if (currency?.type === 'token' || currency?.type === 'nft') {
				// If sending token or NFT
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
			if (currency?.type === 'native') {
				let maxAmount = currentBalanceData.amount - feeBigInt;
				if (maxAmount < 0) maxAmount = 0n;
				amount = formatUnits(maxAmount, currentBalanceData.decimals || 18);
			} else if (currency?.type === 'token') {
				// If sending token, use full token balance (fee is paid in native currency)
				amount = formatUnits(currentBalanceData.amount, currentBalanceData.decimals || 18);
			} else if (currency?.type === 'nft') {
				// For NFTs, use full balance (as integer)
				amount = currentBalanceData.amount.toString();
			}
		} catch (e) {
			console.error('Error setting max amount:', e);
		}
	}

	// Helper function to set error with optional hint
	function setError(message: string, hint?: string) {
		error = message;
		errorHint = hint || null;
	}

	// Helper function to clear errors
	function clearError() {
		error = null;
		errorHint = null;
	}

	async function send() {
		clearError();
		// Validation config
		const validationConfig: FormValidatorConfig = [
			{
				field: $sendAddress,
				element: elAddressInput,
				required: 'Address is required',
				validate: value => {
					// Sanitize and validate address
					const sanitizedAddress = value?.toString().trim();
					if (!sanitizedAddress) return 'Address is required';
					if (!isValidContractAddress(sanitizedAddress)) {
						return 'Invalid address format. Address must be a valid Ethereum address (0x followed by 40 hex characters)';
					}
					return null;
				},
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
					// NFT-specific validation
					const nftError = validateNftTransaction();
					if (nftError) return nftError;

					// General amount validation for non-NFTs
					if (currency?.type !== 'nft') {
						const etherAmount = getEtherAmount(value);
						if (!etherAmount) return 'Invalid amount';
					}

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
			setError(validationError);
			return;
		}
		// If validation passes, create payment
		let etherAmount: bigint;
		if (currency?.type === 'token' && currentBalanceData) {
			// For tokens, use the correct decimals from token info
			etherAmount = parseUnits(amount!.toString().replace(',', '.'), currentBalanceData.decimals || 18);
		} else if (currency?.type === 'nft') {
			// For NFTs, always use 0 decimals (whole numbers only) - use BigInt directly for safety
			etherAmount = BigInt(amount!.toString().trim());
		} else {
			// For native currency, use 18 decimals
			etherAmount = getEtherAmount(amount || 0)!;
		}
		const etherFee = getEtherAmount($fee);
		// Sanitize address parameter
		const sanitizedAddress = $sendAddress!.toString().trim();
		payment = {
			address: sanitizedAddress,
			amount: etherAmount,
			fee: etherFee!,
			symbol: currency?.symbol,
			contractAddress: currency?.type === 'token' || currency?.type === 'nft' ? currency.contract_address : undefined,
			tokenId: currency?.type === 'nft' ? currency.tokenId : undefined,
			nftStandard: currency?.type === 'nft' ? currency.standard : undefined,
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
				clearError();

				// Navigate to History section
				setSection('history');
			} catch (err) {
				console.error('Transaction failed:', err);

				// Keep the actual error message, but add helpful hints
				if (err instanceof Error) {
					const errorMessage = err.message.toLowerCase();

					if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
						setError(err.message, 'Check your balance and network fees. You may need more of the native currency to pay for gas.');
					} else if (errorMessage.includes('gas') && errorMessage.includes('limit')) {
						setError(err.message, 'The network may be congested. Try again later or increase the transaction fee.');
					} else if (errorMessage.includes('nonce')) {
						setError(err.message, 'This usually resolves itself. Please wait a moment and try again.');
					} else if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
						setError(err.message, 'You may have declined the transaction in your wallet. Try again and approve the transaction.');
					} else if (errorMessage.includes('network')) {
						setError(err.message, 'Check your internet connection and try again. The blockchain network may be temporarily unavailable.');
					} else if (errorMessage.includes('revert')) {
						if (currency?.type === 'nft') {
							setError(err.message, 'You may not own this NFT anymore, or it may not be transferable. Check your NFT balance and try again.');
						} else {
							setError(err.message, 'The smart contract rejected this transaction. Check the transaction details and try again.');
						}
					} else {
						setError(err.message, 'If this error persists, try refreshing the page or contacting support.');
					}
				} else {
					setError('Transaction failed due to an unknown error', 'Please try again. If the problem persists, try refreshing the page.');
				}
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
				<Input bind:value={amount} bind:this={elAmountInput} enabled={!!($selectedNetwork && $selectedAddress)} onChange={handleAmountChange} type={currency?.type === 'nft' ? 'number' : 'text'} step={currency?.type === 'nft' ? 1 : undefined} min={currency?.type === 'nft' ? 1 : undefined} data-testid="wallet-send-amount-input" />
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
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="30px" padding="0" onClick={() => estimateFeeWithLogging(currency?.type === 'token' || currency?.type === 'nft' ? currency.contract_address : undefined, 'manual refresh')} />
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
							{#if currency?.type === 'token' || currency?.type === 'nft'}
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
						{:else if currency?.type === 'native'}
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
			{#if errorHint}
				<Alert type="info" message={errorHint} />
			{/if}
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
