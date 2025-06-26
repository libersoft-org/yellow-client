<script lang="ts">
	import { get } from 'svelte/store';
	import { parseUnits } from 'ethers';
	import { module } from '../module.ts';
	import { currencies, selectedMainCurrencySymbol, selectedAddress, selectedNetwork } from '../wallet.ts';
	import Tabs from '@/core/components/Tabs/Tabs.svelte';
	import TabsItem from '@/core/components/Tabs/TabsItem.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import QRCode from 'qrcode';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	let addressElement: HTMLElement | undefined = $state();
	let addressElementMessage: string | null = $state('');
	let activeTab = $state('address');
	let walletAddress = $state();
	let amount = $state('0');
	let currency = $state();
	let qr: string = $state('');
	let error: string | null = $state(null);

	$effect(() => {
		updateAddressAndQR();
	});

	function updateAddressAndQR() {
		//console.log('updateAddressAndQR called');
		if ($selectedNetwork && $selectedAddress) {
			if (activeTab === 'address') {
				walletAddress = $selectedAddress.address;
				console.log('walletAddress:', walletAddress);
			} else {
				let etherValue;
				//console.log('amount:', amount);
				try {
					etherValue = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
					//console.log('etherValue:', etherValue.toString());
				} catch (e) {
					error = 'Invalid amount';
					//console.log('Invalid amount:', e);
					return;
				}
				error = null;
				walletAddress = 'ethereum:' + $selectedAddress.address + '@' + $selectedNetwork.chainID + (amount ? '?value=' + etherValue.toString() : '');
			}
			generateQRCode(walletAddress, qrData => (qr = qrData));
		}
	}

	function generateQRCode(text, callback) {
		QRCode.toDataURL(text, { width: 150 }, function (err, qr) {
			if (err) console.error('QR CODE GENERATION:', err);
			else callback(qr);
		});
	}

	function clickCopy() {
		navigator.clipboard
			.writeText(walletAddress)
			.then(() => console.log('Text copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));

		addressElementMessage = 'Copied!';
		setTimeout(() => (addressElementMessage = null), 1000);
	}

	function resetCurrency(currencies) {
		if (!currency || !get(currencies).find(c => c == currency)) {
			console.log('reset currency:', currency, get(currencies));
			currency = $selectedMainCurrencySymbol;
		}
	}

	function setActiveTab(name) {
		activeTab = name;
		if (activeTab === 'payment') resetCurrency(currencies);
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
					<Input type="string" bind:value={amount} />
					<DropdownFilter options={$currencies} bind:selected={currency} />
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
