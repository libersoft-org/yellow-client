<script>
	import { shortenAddress } from '@/lib/utils/shortenAddress.ts';
	import { mobileClass } from '@/core/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import QRCode from 'qrcode';
	import { currencies, selectedMainCurrencySymbol, selectedAddress, selectedNetwork } from '../wallet.ts';
	import { parseUnits } from 'ethers';
	import { get } from 'svelte/store';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	let addressElement;
	let paymentElement;
	let amount = '0';
	let qrAddress = '';
	let qrPayment = '';
	let paymentText = '';
	let error = '';
	let currency;

	$: resetCurrency(currencies);

	function resetCurrency(currencies) {
		if (!currency || !get(currencies).find(c => c == currency)) {
			console.log('reset currency:', currency, get(currencies));
			currency = $selectedMainCurrencySymbol;
		}
	}

	$: console.log('currencies:', $currencies);
	$: console.log('currency:', currency);

	function clickCopyAddress() {
		navigator.clipboard
			.writeText($selectedAddress.address)
			.then(() => console.log('Address copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		addressElement.innerHTML = 'Copied!';
		setTimeout(() => (addressElement.innerHTML = $selectedAddress.address), 1000);
	}

	function clickCopyPayment() {
		navigator.clipboard
			.writeText(paymentText)
			.then(() => console.log('Payment URI copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		paymentElement.innerHTML = 'Copied!';
		setTimeout(() => (paymentElement.innerHTML = paymentText), 1000);
	}

	$: if ($selectedNetwork && $selectedAddress) updateAmount(amount);

	function updateAmount(amount) {
		let etherValue;
		console.log('amount:', amount);
		try {
			etherValue = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
			console.log('etherValue:', etherValue.toString());
		} catch (e) {
			error = 'Invalid amount';
			console.log('Invalid amount:', e);
			return;
		}
		error = '';
		paymentText = 'ethereum:' + $selectedAddress.address + '@' + $selectedNetwork.chainID + (amount ? '?value=' + etherValue.toString() : '');
		generateQRCode($selectedAddress.address, url => (qrAddress = url));
		generateQRCode(paymentText, url => (qrPayment = url));
	}

	function generateQRCode(text, callback) {
		QRCode.toDataURL(text, { width: 150 }, function (err, url) {
			if (err) console.error('QR CODE GENERATION:', err);
			else callback(url);
		});
	}
</script>

<style>
	.receive {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 10px;
	}

	.section {
		display: flex;
		justify-content: center;
		border: 1px solid var(--secondary-background);
		border-radius: 10px;
		width: 100%;
	}

	.section-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
		gap: 10px;
	}

	.section-wrapper .bold {
		margin-bottom: auto;
	}

	.address {
		display: flex;
		align-items: center;
		gap: 5px;
		border-radius: 10px;
		padding: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.address .clamp {
		display: inline-block;
		width: 100px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		vertical-align: bottom;
	}

	.address .clamp.mobile {
		width: 200px;
	}

	.amount {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
</style>

{#if $selectedNetwork && $selectedAddress}
	<div class="receive">
		<div class="section">
			<div class="section-wrapper">
				<div class="bold">Your wallet address:</div>
				<Clickable onClick={clickCopyAddress}>
					<div class="address">
						<div class="clamp {$mobileClass}" bind:this={addressElement}>
							{shortenAddress($selectedAddress.address)}
						</div>
						<Icon img="img/copy.svg" alt="Copy" colorVariable="--secondary-foreground" size="15px" padding="0px" />
					</div>
				</Clickable>
				<div class="qr"><img src={qrAddress} alt="Address" /></div>
			</div>
		</div>
		<div class="section">
			<div class="section-wrapper">
				<div class="bold">Payment:</div>
				<div class="amount">
					<div>Amount:</div>
					<Input type="number" placeholder="0.0" step="0.00001" min="0" max="999999999999999999999999" bind:value={amount} />
					<DropdownFilter options={$currencies} bind:selected={currency} />
					{#if error}
						<Alert type="error" message={error} />
					{/if}
				</div>
				<Clickable onClick={clickCopyPayment}>
					<div class="address">
						<div class="clamp" style="width: 240px !important;" bind:this={paymentElement}>
							{paymentText}
						</div>
						<Icon img="img/copy.svg" alt="Copy" colorVariable="--secondary-foreground" size="15px" padding="0px" />
					</div>
				</Clickable>
				<div class="qr"><img src={qrPayment} alt="Payment" /></div>
			</div>
		</div>
	</div>
{/if}
