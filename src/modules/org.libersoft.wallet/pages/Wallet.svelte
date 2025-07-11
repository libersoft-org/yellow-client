<script lang="ts">
	import { onMount } from 'svelte';
	import { module } from '../scripts/module.ts';
	import { section, setSection, status, rpcURL, selectedNetwork, selectedAddress, settingsWindow, walletsWindow, rpcServersWindow, initializeDefaultNetworks, reconnect, availableRPCURLs } from '../scripts/wallet.ts';
	import { shortenAddress } from '@/lib/utils/shortenAddress.ts';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Dropdown from '../components/Dropdown.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Settings from '@/org.libersoft.wallet/windows/Settings/Settings.svelte';
	import Send from '@/org.libersoft.wallet/pages/Send.svelte';
	import Receive from '@/org.libersoft.wallet/pages/Receive.svelte';
	import Balance from '@/org.libersoft.wallet/pages/Balance.svelte';
	import History from '@/org.libersoft.wallet/pages/History.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	import WindowNetworks from '@/org.libersoft.wallet/windows/Networks/Networks.svelte';
	import WindowWallets from '@/org.libersoft.wallet/windows/Wallets/Wallets.svelte';
	import WindowRPCServers from '@/org.libersoft.wallet/windows/RPCServers/RPCServers.svelte';
	let elWindowNetworks;
	let addressElement = $state<HTMLElement | null>(null);

	onMount(() => {
		initializeDefaultNetworks();
	});

	function clickCopyAddress() {
		if ($selectedAddress && addressElement) {
			navigator.clipboard
				.writeText($selectedAddress.address)
				.then(() => console.log('Address copied to clipboard'))
				.catch(err => console.error('Error while copying to clipboard', err));
			addressElement.innerHTML = 'Copied!';
			setTimeout(() => {
				if (addressElement) {
					addressElement.innerHTML = shortenAddress($selectedAddress.address);
				}
			}, 1000);
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
			<Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} onClick={async () => await elWindowNetworks?.open()} data-testid="wallet-network-dropdown" />
			<Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} onClick={async () => await $walletsWindow?.open()} />
		</div>
		<div class="bar">
			<div class="left">
				<div class="status">
					<div class="indicator {$status.color}"></div>
					<div>{$status.text}</div>
					<Icon img="img/reset.svg" colorVariable="--secondary-foreground" size="12px" padding="5px" onClick={reconnect} alt="Retry connection" />
				</div>
				<div class="server">
					{#if $selectedNetwork && $availableRPCURLs && $availableRPCURLs.length > 1}
						<Dropdown text={$rpcURL || 'Select RPC server'} onClick={() => $rpcServersWindow?.open()} />
					{/if}
				</div>
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
				<Icon img="img/settings.svg" colorVariable="--secondary-foreground" padding="0px" onClick={() => $settingsWindow?.open()} testId="wallet-settings-btn" />
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

<Window title="Select your network" body={WindowNetworks} bind:this={elWindowNetworks} width="500px" />
<WindowWallets />
<Window title="Select RPC Server" body={WindowRPCServers} bind:this={$rpcServersWindow} width="600px" />
<Settings />
