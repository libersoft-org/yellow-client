<script lang="ts">
	import { parseUnits } from 'ethers';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { selectedNetwork, currencies } from '@/org.libersoft.wallet/scripts/network.ts';
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

	$effect(() => {
		updateAddressAndQR();
	});

	function updateAddressAndQR(): void {
		if ($selectedNetwork && $selectedAddress) {
			if (activeTab === 'address') {
				walletAddress = $selectedAddress.address;
				console.log('walletAddress:', walletAddress);
			} else {
				let etherValue: bigint | undefined;
				if (amount) amount = amount.trim();
				if (amount) {
					try {
						etherValue = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
					} catch (e) {
						error = 'Invalid amount';
						return;
					}
				}
				error = null;
				walletAddress = 'ethereum:' + $selectedAddress.address + '@' + $selectedNetwork.chainID + (etherValue ? '?value=' + etherValue.toString() : '');
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
					<div>Amount:</div>
					<Input type="text" bind:value={amount} bind:this={elAmountInput} />
					<DropdownFilter options={$currencies.filter(c => c !== undefined)} bind:selected={currency} />
				</div>
				{#if error}
					<Alert type="error" message={error} />
				{/if}
			{/if}
			{#if activeTab === 'address' || (activeTab === 'payment' && !error)}
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
