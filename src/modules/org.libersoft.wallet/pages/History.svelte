<script lang="ts">
	import { selectedNetwork } from 'libersoft-crypto/network';
	import { selectedAddress } from 'libersoft-crypto/wallet';
	import { transactionLog, refreshTransactionStatus, getTxAmountAsBigInt, type TxLogEntry } from '@/org.libersoft.wallet/scripts/log.ts';
	import { formatBalance } from 'libersoft-crypto/balance';
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
	import Spinner from '@/core/components/Spinner/Spinner.svelte';

	let link: string | undefined = $state();
	let elLink: HTMLDivElement | undefined = $state();
	let refreshingTxIds = $state(new Set<string>());

	// Get transactions for current network
	let transactions = $derived.by(() => {
		if (!$selectedNetwork?.guid) return [];
		// Force reactivity by accessing the entire transactionLog store
		const allLogs = $transactionLog;
		console.log('📊 Transactions updated for network:', $selectedNetwork.guid, 'Total logs:', Object.keys(allLogs).length);
		const networkTransactions = allLogs[$selectedNetwork.guid] || [];
		console.log('📋 Network transactions:', networkTransactions.length, networkTransactions);
		return networkTransactions;
	});

	$effect(() => {
		if ($selectedNetwork && $selectedAddress) {
			if ($selectedNetwork.explorerURL) link = $selectedNetwork.explorerURL + '/address/' + $selectedAddress.address;
			else link = undefined;
		}
	});

	// Debug effect to track store changes
	$effect(() => {
		const logKeys = Object.keys($transactionLog);
		console.log('🔄 TransactionLog store changed. Networks with transactions:', logKeys);
		if ($selectedNetwork?.guid) {
			const currentNetworkTxs = $transactionLog[$selectedNetwork.guid] || [];
			console.log('📊 Current network transactions count:', currentNetworkTxs.length);
			currentNetworkTxs.forEach(tx => {
				console.log(`  - TX ${tx.id}: ${tx.status} (${tx.hash?.slice(0, 10)}...)`);
			});
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

	function refreshRow(tx: TxLogEntry): void {
		console.log('Refresh clicked for transaction:', tx.id, tx.hash);
		if (refreshingTxIds.has(tx.id)) return; // Already refreshing
		refreshingTxIds.add(tx.id);
		refreshingTxIds = new Set(refreshingTxIds); // Trigger reactivity
		refreshTransactionStatus(tx.id)
			.then(() => console.log('✅ Refresh completed successfully for:', tx.id))
			.catch(error => console.error('❌ Refresh failed for:', tx.id, error))
			.finally(() => {
				refreshingTxIds.delete(tx.id);
				refreshingTxIds = new Set(refreshingTxIds); // Trigger reactivity
				console.log('🔄 Refresh finished for:', tx.id);
			});
	}

	function openTransactionInExplorer(tx: TxLogEntry): void {
		console.log('Opening transaction in explorer:', tx.hash, $selectedNetwork?.explorerURL);
		if (!tx.hash || !$selectedNetwork?.explorerURL) return;
		const txUrl = $selectedNetwork.explorerURL + '/tx/' + tx.hash;
		console.log('Opening URL:', txUrl);
		window.open(txUrl, '_blank');
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
			{#if transactions.length > 0}
				{#each transactions as tx}
					<Table expand>
						<Tbody>
							<TbodyTr>
								<Td bold>Address:</Td>
								<Td>{tx.address}</Td>
							</TbodyTr>
							{#if tx.hash}
								<TbodyTr>
									<Td bold>Transaction hash:</Td>
									<Td>{tx.hash}</Td>
								</TbodyTr>
							{/if}
							<TbodyTr>
								<Td bold>Amount:</Td>
								<Td>{formatBalance({ amount: getTxAmountAsBigInt(tx), currency: tx.currency, decimals: tx.decimals })}</Td>
							</TbodyTr>
							<TbodyTr>
								<Td bold>Status:</Td>
								<Td>
									<div class="tx-status">
										<span class="dot {tx.status === 'Error' ? 'error' : tx.status === 'Pending' ? 'pending' : tx.status === 'Success' ? 'success' : 'not-sent'}"></span>
										<span>{tx.status}</span>
									</div>
								</Td>
							</TbodyTr>
							<TbodyTr>
								<Td bold>Date and time:</Td>
								<Td>{new Date(tx.timestamp).toLocaleString()}</Td>
							</TbodyTr>
							<TbodyTr>
								<Td bold>Action:</Td>
								<Td>
									<ActionItems>
										{#if refreshingTxIds.has(tx.id)}
											<Spinner size="10px" />
										{:else}
											{#if tx.hash && $selectedNetwork?.explorerURL}
												<Icon img="img/link.svg" alt="Open in explorer" colorVariable="--primary-foreground" size="20px" padding="5px" enabled={true} onClick={() => openTransactionInExplorer(tx)} />
											{/if}
											<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="20px" padding="5px" enabled={true} onClick={() => refreshRow(tx)} />
										{/if}
									</ActionItems>
								</Td>
							</TbodyTr>
						</Tbody>
					</Table>
				{/each}
			{:else}
				<div>No transactions found</div>
			{/if}
		</div>
	{/if}
{/if}
