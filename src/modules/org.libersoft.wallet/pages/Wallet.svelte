<script>
	import { debug } from '@/core/stores.ts';
	import { module } from '../module.js';
	import { section, setSection, status, rpcURL, balance, selectedNetwork, selectedAddress, balanceTimestamp } from '../wallet.ts';
	import { shortenAddress } from '@/lib/utils/shortenAddress.ts';
	import Paper from '@/core/components/Paper/Paper.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import ModalSettings from '../modals/Settings/Settings.svelte';
	import Send from './Send.svelte';
	import Receive from './Receive.svelte';
	import Balance from './Balance.svelte';
	import History from './History.svelte';
	let addressElement;
	let showModalSettings = false;

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

	.bar .right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.bar .right .address {
		display: flex;
		gap: 5px;
	}

	.balance {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.balance .crypto {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 25px;
		font-weight: bold;
	}

	.balance .crypto img {
		width: 50px;
		height: 50px;
	}

	.balance .fiat {
		color: var(--default-foreground);
		text-align: center;
	}

	.buttons {
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

	.separator {
		width: 100%;
		border-bottom: 1px solid var(--default-foreground);
	}
</style>

<Paper>
	<div class="body">
		<div class="bar">
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
									<Icon img="img/copy.svg" colorVariable="--secondary-foreground" alt="Copy" size="15px" padding="0px" />
								</div>
							</Clickable>
						{:else}
							<div class="address">No address selected</div>
						{/if}
					</div>
				</div>
				<Icon img="img/settings.svg" colorVariable="--secondary-foreground" padding="0px" onClick={() => (showModalSettings = true)} />
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
		<div class="buttons">
			<Button img="modules/{module.identifier}/img/send.svg" colorVariable="--primary-foreground" text="Send" onClick={() => setSection('send')} />
			<Button img="modules/{module.identifier}/img/receive.svg" colorVariable="--primary-foreground" text="Receive" onClick={() => setSection('receive')} />
			<Button img="modules/{module.identifier}/img/balance.svg" colorVariable="--primary-foreground" text="Balance" onClick={() => setSection('balance')} />
			<Button img="modules/{module.identifier}/img/history.svg" colorVariable="--primary-foreground" text="History" onClick={() => setSection('history')} />
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
<Modal title="Wallet settings" body={ModalSettings} bind:show={showModalSettings} width="500px" />
