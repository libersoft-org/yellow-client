<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import QRCode from 'qrcode';
	import { parseUnits, Contract } from 'ethers';
	import { generatePaymentURL } from '@/org.libersoft.wallet/scripts/payment-qr.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { selectedAddress } from 'libersoft-crypto/wallet';
	import { selectedNetwork, type ICurrency } from 'libersoft-crypto/network';
	import { currencies } from 'libersoft-crypto/currencies';
	import { tokens } from 'libersoft-crypto/tokens';
	import { provider } from 'libersoft-crypto/provider';
	import { getBatchTokensInfo } from 'libersoft-crypto/tokens';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	let addressElement: HTMLElement | undefined = $state();
	let addressElementMessage: string | null | undefined = $state();
	let activeTab: 'address' | 'payment' = $state('address');
	let walletAddress: string | undefined = $state();
	let amount: string | undefined = $state();
	let currency: ICurrency | undefined = $state();
	let currentCurrency: ICurrency | undefined = undefined;
	let qr: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elAmountInput: Input | undefined = $state();
	let tokenDecimalsCache = new Map<string, number>(); // Cache for token decimals to avoid repeated blockchain calls
	let tokenInfos = $state(new Map<string, { name: string; symbol: string }>());
	let isLoadingTokenInfos = $state(false);
	// Track subscriptions for cleanup
	let networkUnsubscribe: (() => void) | null = null;
	let addressUnsubscribe: (() => void) | null = null;
	let isInitialized = $state(false);
	// Create dropdown options from currencies
	let currencyOptions = $derived.by(() => {
		return $currencies.map(currency => {
			let label = currency.symbol || 'Unknown';
			// For tokens with contract addresses, get proper name and symbol from tokenInfos
			if (currency.contract_address) {
				const tokenInfo = tokenInfos.get(currency.contract_address);
				if (tokenInfo?.name && tokenInfo?.symbol) label = tokenInfo.name + ' (' + tokenInfo.symbol + ')';
				else if (tokenInfo?.name && !tokenInfo?.symbol) label = tokenInfo?.name;
				else if (!tokenInfo?.name && tokenInfo?.symbol) label = tokenInfo?.symbol;
				else label = 'Unknown token (' + currency.contract_address.slice(0, 8) + '...)';
			}
			return {
				label: label,
				icon: { img: currency.iconURL || 'modules/' + module.identifier + '/img/token.svg', size: '16px' },
				value: currency, // Use the actual ICurrency object like Send.svelte
			};
		});
	});

	onMount(() => {
		loadTokenInfos();
		// Set up subscription to watch for network changes only
		let currentNetworkGuid = $selectedNetwork?.guid;
		let currentAddressString = $selectedAddress?.address;
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
			// Create address objects for comparison
			const currentAddressObj = { address: currentAddressString };
			handleAddressChange(newAddress, currentAddressObj as any);
			currentAddressString = newAddress?.address;
		});
		isInitialized = true; // Mark as initialized to enable reactive effects
		// Initialize current currency tracking
		currentCurrency = currency;
		// Initial QR code generation
		updateAddressAndQR();
	});

	onDestroy(() => {
		// Clean up subscriptions
		if (networkUnsubscribe) {
			networkUnsubscribe();
			networkUnsubscribe = null;
		}
		if (addressUnsubscribe) {
			addressUnsubscribe();
			addressUnsubscribe = null;
		}
	});

	// Helper function for handling network changes - reload token infos only on actual network change
	function handleNetworkChange(newNetwork: typeof $selectedNetwork, currentNetwork: typeof $selectedNetwork) {
		// Only reload if the actual network (not just RPC) changed - compare by network GUID
		const networkChanged = newNetwork?.guid !== currentNetwork?.guid;
		if (isInitialized && networkChanged && newNetwork) {
			// Clear selected currency when network changes
			currency = undefined;
			currentCurrency = undefined;
			loadTokenInfos();
		}
		// Update QR code when network changes
		if (isInitialized && networkChanged) {
			updateAddressAndQR();
		}
	}

	// Helper function for handling address changes
	function handleAddressChange(newAddress: typeof $selectedAddress, currentAddress: typeof $selectedAddress) {
		// Compare by address string instead of object reference to avoid proxy equality issues
		const addressChanged = newAddress?.address !== currentAddress?.address;
		if (isInitialized && addressChanged) {
			updateAddressAndQR();
		}
	}

	// Helper function for handling active tab changes
	function handleActiveTabChange() {
		if (isInitialized) {
			updateAddressAndQR();
		}
	}

	// Helper function for handling amount changes
	function handleAmountChange(newAmount: string | number) {
		amount = newAmount.toString();
		if (isInitialized) {
			updateAddressAndQR();
		}
	}

	// Helper function for handling currency changes
	function handleCurrencyChange() {
		// Only proceed if currency actually changed
		if (currentCurrency !== currency) {
			if (isInitialized) {
				updateAddressAndQR();
			}
			currentCurrency = currency;
		}
	}

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
			console.error('Error loading token infos in Receive:', error);
		} finally {
			isLoadingTokenInfos = false;
		}
	}

	async function getTokenDecimals(contractAddress: string): Promise<number> {
		// Check cache first
		if (tokenDecimalsCache.has(contractAddress)) return tokenDecimalsCache.get(contractAddress)!;
		try {
			if (!$provider) {
				console.warn('Provider not available, using default decimals');
				return 18;
			}
			const abi = ['function decimals() view returns (uint8)'];
			const contract = new Contract(contractAddress, abi, $provider);
			const decimals = await contract.decimals();
			tokenDecimalsCache.set(contractAddress, Number(decimals));
			return Number(decimals);
		} catch (error) {
			console.error('Error fetching token decimals:', error);
			return 18;
		}
	}

	async function updateAddressAndQR(): Promise<void> {
		if ($selectedNetwork && $selectedAddress) {
			if (activeTab === 'address') {
				walletAddress = $selectedAddress.address;
			} else {
				if (!currency) {
					walletAddress = undefined;
					qr = undefined;
					return;
				}
				// Check if the selected currency is the native currency or a token
				let amount_value: bigint | undefined;
				if (amount) amount = amount.trim();
				if (amount) {
					try {
						if (!currency.contract_address) {
							// For native currency (ETH), use 18 decimals
							amount_value = parseUnits(amount.toString(), 18);
						} else if (currency.contract_address) {
							// For tokens, get the correct decimals from contract
							const decimals = await getTokenDecimals(currency.contract_address);
							amount_value = parseUnits(amount.toString(), decimals);
						} else {
							error = 'Invalid currency';
							return;
						}
					} catch (e) {
						error = 'Invalid amount';
						return;
					}
				}
				error = null;
				walletAddress = generatePaymentURL({
					address: $selectedAddress.address,
					chainID: $selectedNetwork.chainID,
					currency,
					amount: amount_value,
				});
			}
			if (walletAddress) generateQRCode(walletAddress, qrData => (qr = qrData));
		}
	}

	function generateQRCode(text: string, callback: (qr: string) => void): void {
		QRCode.toDataURL(text, { width: 150 }, function (err, qr) {
			if (err) console.error('QR CODE GENERATION:', err);
			else callback(qr);
		});
	}

	function clickCopy(): void {
		if (!walletAddress) return;
		navigator.clipboard
			.writeText(walletAddress)
			.then(() => console.log('Text copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		addressElementMessage = 'Copied!';
		setTimeout(() => (addressElementMessage = null), 1000);
	}

	async function setActiveTab(name: 'address' | 'payment'): Promise<void> {
		activeTab = name;
		handleActiveTabChange(); // Manually trigger QR update
		if (activeTab === 'payment') {
			await tick();
			elAmountInput?.focus();
		}
	}
</script>

<style>
	.receive {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		box-sizing: border-box;
		width: 100%;
		padding: 10px;
		border: 1px solid var(--primary-harder-background);
		border-radius: 10px;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
	}

	.amount {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.address-wrapper {
		width: auto;
		max-width: 100%;
	}

	.address {
		display: flex;
		align-items: center;
		gap: 5px;
		box-sizing: border-box;
		width: 100%;
		padding: 10px;
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.address .text {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

{#if $selectedNetwork && $selectedAddress}
	<div class="receive">
		<Tabs>
			<TabsItem label="Address only" img="modules/{module.identifier}/img/wallet-address.svg" active={activeTab === 'address'} onClick={() => setActiveTab('address')} />
			<TabsItem label="Payment" img="modules/{module.identifier}/img/balance.svg" active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} />
		</Tabs>
		<div class="section">
			{#if activeTab === 'payment'}
				<div class="amount">
					<Input type="text" placeholder="Amount" value={amount} onChange={handleAmountChange} bind:this={elAmountInput} />
					{#if isLoadingTokenInfos}
						<div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px;">
							<Spinner size="16px" />
						</div>
					{:else}
						<DropdownFilter placeholder="Currency" options={currencyOptions} bind:selected={currency} onChange={handleCurrencyChange} />
					{/if}
				</div>
				{#if error}
					<Alert type="error" message={error} />
				{/if}
			{/if}
			{#if activeTab === 'address' || (activeTab === 'payment' && currency !== null && currency !== undefined && !error)}
				<div class="address-wrapper">
					<Clickable onClick={() => clickCopy()} expand={true}>
						<div class="address">
							<div class="text" bind:this={addressElement}>{addressElementMessage || walletAddress}</div>
							<Icon img="img/copy.svg" alt="Copy" colorVariable="--secondary-foreground" size="15px" padding="0px" />
						</div>
					</Clickable>
				</div>
				<div class="qr">
					<img src={qr} alt={activeTab === 'address' ? 'Address' : 'Payment'} />
				</div>
			{/if}
		</div>
	</div>
{/if}
