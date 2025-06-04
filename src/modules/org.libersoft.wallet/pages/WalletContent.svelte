<script>
	import { onMount } from 'svelte';
	import { module } from '../module.js';
	import { status, rpcURL, balance, selectedNetwork, selectedAddress, balanceTimestamp } from '../wallet.ts';
	import { hideSidebarMobile, debug } from '@/core/core.ts';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalNetworks from '../modals/Networks.svelte';
	import ModalWallets from '../modals/Wallets.svelte';
	import ModalSettings from '../modals/Settings/Settings.svelte';
	import Send from './Send.svelte';
	import Receive from './Receive.svelte';
	import Balance from './Balance.svelte';
	import History from './History.svelte';
	import Dropdown from '../components/Dropdown.svelte';
	import { shortenAddress } from '@/lib/utils/shortenAddress.ts';
	let section = 'balance';
	let showModalNetworks = false;
	let showModalWallets = false;
	let showModalSettings = false;
	let addressElement;

	onMount(() => {
		hideSidebarMobile.set(true);
	});

	function clickBackButton() {
		console.log('hideSidebarMobile.set(false)');
		hideSidebarMobile.set(false);
	}

	function setSection(name) {
		section = name;
	}

	selectedNetwork.subscribe(v => {
		console.log('selectedNetwork', v);
	});

	selectedAddress.subscribe(v => {
		console.log('selectedAddress', v);
	});

	function clickCopyAddress() {
		navigator.clipboard
			.writeText($selectedAddress.address)
			.then(() => console.log('Address copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		addressElement.innerHTML = 'Copied!';
		setTimeout(() => (addressElement.innerHTML = shortenAddress($selectedAddress.address)), 1000);
	}
</script>

<style>
	.wallet-content {
		background: var(--background-image) 0 0 / 400px repeat;
		height: 100vh;
	}

	.wallet {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 72px);
		overflow: auto;
		padding: 10px;
	}

	.wallet .content {
		width: 100%;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.body .top {
		display: flex;
		flex-direction: column;
		width: 100%;

		.top-wrapper {
			display: flex;
			justify-content: space-between;
		}
	}

	.body .top .left {
		.status {
			vertical-align: bottom;
			display: flex;
			align-items: center;
			gap: 5px;
			height: 20px;
		}
	}

	.body .top .left .status .indicator {
		border-radius: 50%;
		min-width: 10px;
		min-height: 10px;
		border: 1px solid #000;
	}

	.body .top .left .status .indicator.red {
		background-color: #a00;
	}

	.body .top .left .status .indicator.orange {
		background-color: #f80;
	}

	.body .top .left .status .indicator.green {
		background-color: #0a0;
	}

	.body .balance {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.body .balance .crypto {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		font-size: 25px;
		font-weight: bold;
	}

	.body .balance .crypto img {
		display: block;
		width: 50px;
		height: 50px;
	}

	.body .balance .fiat {
		font-size: 16px;
		color: var(--default-foreground);
		text-align: center;
		white-space: nowrap;
	}

	.body .right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: max-content;
		gap: 10px;

		.address {
			display: flex;
			align-items: center;
			justify-content: right;
			gap: 5px;
		}
	}

	.body .buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		justify-content: center;

		@media (max-width: 1024px) {
			grid-template-columns: repeat(2, 1fr);
		}

		:global(.button) {
			width: 100%;
		}

		:global(.clickable) {
			display: flex;
			width: 100%;
		}
	}

	.body .separator {
		width: 100%;
		border-bottom: 1px solid var(--default-foreground);
	}
</style>

<div class="wallet-content">
	<TopBar>
		<svelte:fragment slot="left">
			<Icon img="img/back.svg" onClick={clickBackButton} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<Dropdown text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'} colorVariable="--secondary-foreground" onClick={() => (showModalNetworks = true)} />
		</svelte:fragment>
		<svelte:fragment slot="right">
			<Dropdown text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'} colorVariable="--secondary-foreground" onClick={() => (showModalWallets = true)} />
		</svelte:fragment>
	</TopBar>
	<div class="wallet">
		<Paper>
			<div class="content">
				<div class="body">
					<div class="top">
						<div class="top-wrapper">
							<div class="left">
								<div class="status">
									<div class="indicator {$status.color}"></div>
									<div>{$status.text}</div>
								</div>
								{#if $debug}
									<div style="font-size: 12px">Server: {$rpcURL}</div>
								{/if}
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
													<Icon img="img/copy.svg" colorVariable="--default-foreground" alt="Copy" size="15px" padding="0px" />
												</div>
											</Clickable>
										{:else}
											<div class="address">No address selected</div>
										{/if}
									</div>
								</div>
								<Icon img="img/settings.svg" colorVariable="--default-foreground" padding="0px" onClick={() => (showModalSettings = true)} />
							</div>
						</div>
						<div class="balance">
							<div class="crypto">
								{#if $selectedNetwork?.currency?.iconURL}
									<div>
										<img src={$selectedNetwork.currency.iconURL} alt={$balance.crypto.currency} />
									</div>
								{/if}
								<div>{$balance.crypto.amount} {$balance.crypto.currency}</div>
							</div>
							<div class="fiat">
								({$balance.fiat.amount}
								{$balance.fiat.currency})
							</div>
							{#if $debug}
								<pre>retrieved {$balanceTimestamp}</pre>
							{/if}
						</div>
					</div>
					<div class="buttons">
						<Button img="modules/{module.identifier}/img/send.svg" colorVariable="--primary-foreground" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('send')} />
						<Button img="modules/{module.identifier}/img/receive.svg" colorVariable="--primary-foreground" text="Receive" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('receive')} />
						<Button img="modules/{module.identifier}/img/balance.svg" colorVariable="--primary-foreground" text="Balance" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('balance')} />
						<Button img="modules/{module.identifier}/img/history.svg" colorVariable="--primary-foreground" text="History" enabled={!!($selectedNetwork && $selectedAddress)} onClick={() => setSection('history')} />
					</div>
					<div class="separator"></div>
					<div class="section">
						{#if section == 'send'}
							<Send />
						{:else if section == 'receive'}
							<Receive />
						{:else if section == 'balance'}
							<Balance />
						{:else if section == 'history'}
							<History />
						{/if}
					</div>
				</div>
			</div>
		</Paper>
	</div>
</div>
<Modal title="Select your network" body={ModalNetworks} bind:show={showModalNetworks} width="500px" />
<Modal title="Select your address" body={ModalWallets} bind:show={showModalWallets} width="500px" />
<Modal title="Wallet settings" body={ModalSettings} bind:show={showModalSettings} width="500px" />
