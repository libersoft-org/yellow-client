<script lang="ts">
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { selectedAddress } from 'libersoft-crypto/wallet';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Table from '@/core/components/Table/Table.svelte';
	import Thead from '@/core/components/Table/TableThead.svelte';
	import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
	import Th from '@/core/components/Table/TableTheadTh.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import ActionItems from '@/core/components/Table/TableActionItems.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let link: string | undefined = $state();
	let elLink: HTMLDivElement | undefined = $state();

	// Mocked transactions (newest first)
	type TxStatus = 'Not sent' | 'Pending' | 'Success' | 'Error';
	interface TxRow {
		address: string;
		amount: number;
		currency: string;
		status: TxStatus;
		timestamp: Date;
	}

	let transactions = $state<TxRow[]>([
		{ address: '0xA1b2...34F0', amount: 0.125, currency: 'ETH', status: 'Success', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
		{ address: '0x99cD...12AB', amount: 250, currency: 'USDT', status: 'Pending', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
		{ address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', amount: 0.005, currency: 'BTC', status: 'Error', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
		{ address: '0xDeF1...C0FF', amount: 42, currency: 'DAI', status: 'Not sent', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
	]);
	let sortedTransactions = $derived([...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

	$effect(() => {
		if ($selectedNetwork && $selectedAddress) {
			if ($selectedNetwork.explorerURL) link = $selectedNetwork.explorerURL + '/address/' + $selectedAddress.address;
			else link = undefined;
		}
	});

	function copyLink(): void {
		if (!link) return;
		navigator.clipboard
			.writeText(link)
			.then(() => console.log('Address copied to clipboard'))
			.catch(err => console.error('Error while copying to clipboard', err));
		setInfo('Copied!');
		setTimeout(() => hideInfo(), 1000);
	}

	function openLink(): void {
		window.open(link, '_blank');
	}

	function setInfo(text: string): void {
		if (elLink) elLink.innerText = text;
	}

	function hideInfo(): void {
		if (elLink && link) elLink.innerText = link;
	}

	function refreshRow(_tx: TxRow): void {
		console.log('Refresh clicked for', _tx);
	}
</script>

<style>
	.history {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.url {
		box-sizing: border-box;
		max-width: 100%;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		padding: 10px;
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.tx-table {
		width: 100%;
	}

	.tx-status {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tx-status .dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1px solid #000;
	}

	.tx-status .dot.error {
		background-color: var(--error-color, #a00);
	}

	.tx-status .dot.pending {
		background-color: var(--warning-color, #f80);
	}

	.tx-status .dot.success {
		background-color: var(--success-color, #0a0);
	}

	.tx-status .dot.not-sent {
		background-color: #fff;
	}
</style>

{#if $selectedNetwork && $selectedAddress}
	{#if !link}
		<Alert type="error" message="The selected network has no block explorer" />
	{:else}
		<div class="history">
			<div class="bold">Address history:</div>
			<div class="url" bind:this={elLink}>{link}</div>
			<ButtonBar equalize align="center">
				<Button img="img/copy.svg" text="Copy link" onClick={copyLink} />
				<Button img="img/link.svg" text="Open link" onClick={openLink} />
			</ButtonBar>
			<div class="tx-table">
				<Table>
					<Thead>
						<TheadTr>
							<Th>Adresa</Th>
							<Th>Částka</Th>
							<Th>Stav</Th>
							<Th>Datum a čas</Th>
							<Th></Th>
						</TheadTr>
					</Thead>
					<Tbody>
						{#each sortedTransactions as tx}
							<TbodyTr>
								<Td expand>{tx.address}</Td>
								<Td>{tx.amount} {tx.currency}</Td>
								<Td>
									<div class="tx-status">
										<span class="dot {tx.status === 'Error' ? 'error' : tx.status === 'Pending' ? 'pending' : tx.status === 'Success' ? 'success' : 'not-sent'}"></span>
										<span>{tx.status}</span>
									</div>
								</Td>
								<Td>{tx.timestamp.toLocaleString()}</Td>
								<Td>
									<ActionItems align="right">
										<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="20px" padding="5px" onClick={() => refreshRow(tx)} />
									</ActionItems>
								</Td>
							</TbodyTr>
						{/each}
					</Tbody>
				</Table>
			</div>
		</div>
	{/if}
{/if}
