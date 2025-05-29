<script>
	import { onMount } from 'svelte';
	import { module } from '../module.js';
	import { status, rpcURL, balance, selectedNetwork, selectedAddress, balanceTimestamp } from '../wallet.ts';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalNetworks from '../modals/networks.svelte';
	import ModalWallets from '../modals/wallets.svelte';
	import ModalSettings from '../modals/Settings/Settings.svelte';
	import Send from './send.svelte';
	import Receive from './receive.svelte';
	import Balance from './balance.svelte';
	import History from './history.svelte';
	import Dropdown from '../components/dropdown.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import { hideSidebarMobile, debug } from '@/core/core.js';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
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

	selectedNetwork.subscribe((v) => {
		console.log('xxselectedNetwork', v);
	});

	selectedAddress.subscribe((v) => {
		console.log('xxselectedAddress', v);
	});

	function clickCopyAddress() {
		navigator.clipboard
			.writeText($selectedAddress.address)
			.then(() => console.log('Address copied to clipboard'))
			.catch((err) => console.error('Error while copying to clipboard', err));
		addressElement.innerHTML = 'Copied!';
		setTimeout(() => (addressElement.innerHTML = shortenAddress($selectedAddress.address)), 1000);
	}
</script>

<div class="wallet-content">
	<TopBar>
		<svelte:fragment slot="left">
			<Icon img="img/back.svg" onClick={clickBackButton} colorVariable="--icon-white" visibleOnDesktop={false} />
			<Dropdown
				text={$selectedNetwork ? $selectedNetwork.name : '--- Select your network ---'}
				colorVariable="--icon-black"
				onClick={() => (showModalNetworks = true)}
			/>
		</svelte:fragment>
		<svelte:fragment slot="right">
			<Dropdown
				text={$selectedAddress ? $selectedAddress.name : '--- Select your address ---'}
				colorVariable="--icon-black"
				onClick={() => (showModalWallets = true)}
			/>
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
											<BaseButton onClick={clickCopyAddress}>
												<div class="address">
													<div bind:this={addressElement}>
														{shortenAddress($selectedAddress.address)}
													</div>
													<Icon img="img/copy.svg" alt="Copy" colorVariable="--icon-black" size="15px" padding="0px" />
												</div>
											</BaseButton>
										{:else}
											<div class="address">No address selected</div>
										{/if}
									</div>
								</div>
								<Icon img="img/settings.svg" padding="0px" onClick={() => (showModalSettings = true)} />
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
						<Button
							img="modules/{module.identifier}/img/send.svg"
							text="Send"
							enabled={!!($selectedNetwork && $selectedAddress)}
							onClick={() => setSection('send')}
						/>
						<Button
							img="modules/{module.identifier}/img/receive.svg"
							text="Receive"
							enabled={!!($selectedNetwork && $selectedAddress)}
							onClick={() => setSection('receive')}
						/>
						<Button
							img="modules/{module.identifier}/img/balance.svg"
							text="Balance"
							enabled={!!($selectedNetwork && $selectedAddress)}
							onClick={() => setSection('balance')}
						/>
						<Button
							img="modules/{module.identifier}/img/history.svg"
							text="History"
							enabled={!!($selectedNetwork && $selectedAddress)}
							onClick={() => setSection('history')}
						/>
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

<style>
	.wallet-content {
		background: url('/img/background.webp') repeat;
		background-size: 400px;
		height: 100vh;
	}

	.wallet {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 72px);
		overflow: auto;
		padding: clamp(16px, 1.6vw, 24px);
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
		color: #555;
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

		:global(.base-button) {
			display: flex;
			width: 100%;
		}
	}

	.body .separator {
		width: 100%;
		border-bottom: 1px solid #888;
	}
</style>
