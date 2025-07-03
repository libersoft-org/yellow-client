<script lang="ts">
	import { setContext } from 'svelte';
	import { module } from '../module.ts';
	import { section, setSection, status, rpcURL, selectedNetwork, selectedAddress } from '../wallet.ts';
	import { shortenAddress } from '@/lib/utils/shortenAddress.ts';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Dropdown from '../components/Dropdown.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Settings from '../modals/Settings/Settings.svelte';
	import Send from './Send.svelte';
	import Receive from './Receive.svelte';
	import Balance from './Balance.svelte';
	import History from './History.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalNetworks from '../modals/Networks/Networks.svelte';
	import ModalWallets from '../modals/Wallets/Wallets.svelte';
	let elSettings;
	let elModalNetworks;
	let elModalWallets;
	let addressElement;

	let settings = {};
	setContext('settings', settings);
	$effect(() => {
		settings.elSettings = elSettings;
	});

	function clickCopyAddress() {
		if ($selectedAddress) {
			navigator.clipboard
				.writeText($selectedAddress.address)
				.then(() => console.log('Address copied to clipboard'))
				.catch(err => console.error('Error while copying to clipboard', err));
			addressElement.innerHTML = 'Copied!';
			setTimeout(() => (addressElement.innerHTML = shortenAddress($selectedAddress.address)), 1000);
		}
	}

	selectedNetwork.subscribe(v => {
		console.log('selectedNetwork', v);
	});

	selectedAddress.subscribe(v => {
		console.log('selectedAddress', v);
	});
</script>

<style>
	.body {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px;
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.bar .left .status {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.bar .left .status .indicator {
		border-radius: 50%;
		min-width: 10px;
		min-height: 10px;
	}

	.bar .left .status .indicator.red {
		background-color: #a00;
	}

	.bar .left .status .indicator.orange {
		background-color: #f80;
	}

	.bar .left .status .indicator.green {
		background-color: #0a0;
	}

	.bar .left .server {
		font-size: 12px;
	}

	.bar .right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.bar .right .address {
		display: flex;
		gap: 5px;
	}

	.buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		justify-content: center;

		@media (max-width: 1024px) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.buttons :global(.button) {
		width: 100%;
	}

	.buttons :global(.clickable) {
		display: flex;
		width: 100%;
	}

	.network-address {
		display: flex;
		gap: 10px;
		justify-content: space-between;
	}

	.separator {
		width: 100%;
		border-bottom: 1px solid var(--default-foreground);
	}
</style>

<Paper>
	<div class="body">
		<div class="network-address">
			<Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} onClick={async () => await elModalNetworks?.open()} />
			<Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} onClick={async () => await elModalWallets?.open()} />
		</div>
		<div class="bar">
			<div class="left">
				<div class="status">
					<div class="indicator {$status.color}"></div>
					<div>{$status.text}</div>
				</div>
				<div class="server">Server: {$rpcURL}</div>
			</div>
			<div class="right">
				<div>
					<div>
						{#if $selectedAddress && $selectedAddress.address}
							<Clickable onClick={clickCopyAddress}>
								<div class="address">
									<div bind:this={addressElement}>
										{shortenAddress($selectedAddress.address)}
									</div>
									<Icon img="img/copy.svg" colorVariable="--secondary-foreground" alt="Copy" size="15px" padding="0px" />
								</div>
							</Clickable>
						{:else}
							<div class="address">No address selected</div>
						{/if}
					</div>
				</div>
				<Icon img="img/settings.svg" colorVariable="--secondary-foreground" padding="0px" onClick={() => elSettings.open()} />
			</div>
		</div>
		<div class="buttons">
			<Button img="modules/{module.identifier}/img/send.svg" text="Send" onClick={() => setSection('send')} />
			<Button img="modules/{module.identifier}/img/receive.svg" text="Receive" onClick={() => setSection('receive')} />
			<Button img="modules/{module.identifier}/img/balance.svg" text="Balance" onClick={() => setSection('balance')} />
			<Button img="modules/{module.identifier}/img/history.svg" text="History" onClick={() => setSection('history')} />
		</div>
		<div class="separator"></div>
		{#if !$selectedNetwork || !$selectedAddress}
			<Alert type="error" message="No network or address selected" />
		{/if}
		<div class="section">
			{#if $section == 'send'}
				<Send />
			{:else if $section == 'receive'}
				<Receive />
			{:else if $section == 'balance'}
				<Balance />
			{:else if $section == 'history'}
				<History />
			{/if}
		</div>
	</div>
</Paper>
<Settings bind:this={elSettings} />
<Modal title="Select your network" body={ModalNetworks} bind:this={elModalNetworks} width="500px" />
<Modal title="Select your address" body={ModalWallets} bind:this={elModalWallets} width="500px" />
