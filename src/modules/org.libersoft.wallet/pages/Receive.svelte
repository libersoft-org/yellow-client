<script lang="ts">
	import { parseUnits, Contract } from 'ethers';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { selectedNetwork, currencies, tokens } from '@/org.libersoft.wallet/scripts/network.ts';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import QRCode from 'qrcode';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import { tick } from 'svelte';
	let addressElement: HTMLElement | undefined = $state();
	let addressElementMessage: string | null | undefined = $state();
	let activeTab: 'address' | 'payment' = $state('address');
	let walletAddress: string | undefined = $state();
	let amount: string | undefined = $state();
	let currency: string = $state('');
	let qr: string | undefined = $state();
	let error: string | null | undefined = $state();
	let elAmountInput: Input | undefined = $state();
	let tokenDecimalsCache = new Map<string, number>(); // Cache for token decimals to avoid repeated blockchain calls

	$effect(() => {
		updateAddressAndQR();
	});

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
				console.log('walletAddress:', walletAddress);
			} else {
				if (!currency) {
					walletAddress = undefined;
					qr = undefined;
					return;
				}
				// Check if the selected currency is the native currency or a token
				const isNativeCurrency = currency === $selectedNetwork.currency.symbol;
				const token = isNativeCurrency ? null : $tokens.find(t => t.symbol === currency);
				let amount_value: bigint | undefined;
				if (amount) amount = amount.trim();
				if (amount) {
					try {
						if (isNativeCurrency) {
							// For native currency (ETH), use 18 decimals
							amount_value = parseUnits(amount.toString(), 18);
						} else if (token) {
							// For tokens, get the correct decimals from contract
							const decimals = await getTokenDecimals(token.contract_address);
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
				if (isNativeCurrency) {
					// Native currency payment (ETH) according to ERC-681
					walletAddress = 'ethereum:' + $selectedAddress.address + '@' + $selectedNetwork.chainID + (amount_value ? '?value=' + amount_value.toString() : '');
				} else if (token) {
					// ERC-20 token payment according to ERC-681
					walletAddress = 'ethereum:' + token.contract_address + '@' + $selectedNetwork.chainID + '/transfer' + '?address=' + $selectedAddress.address + (amount_value ? '&uint256=' + amount_value.toString() : '');
				}
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
					<Input type="text" placeholder="Amount" bind:value={amount} bind:this={elAmountInput} />
					<DropdownFilter placeholder="Currency" options={$currencies.filter(c => c !== undefined)} bind:selected={currency} />
				</div>
				{#if error}
					<Alert type="error" message={error} />
				{/if}
			{/if}
			{#if activeTab === 'address' || (activeTab === 'payment' && currency && !error)}
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
