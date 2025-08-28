import { localStorageSharedStore } from '@/lib/svelte-shared-store.ts';
import { provider } from 'libersoft-crypto/provider';
import { selectedNetwork } from 'libersoft-crypto/network';
import { get } from 'svelte/store';

export type TxStatus = 'Not sent' | 'Pending' | 'Success' | 'Error';

export interface TxLogEntry {
	id: string; // Unique ID for the transaction
	hash?: string; // Transaction hash (when available)
	address: string; // Recipient address
	amount: string; // Amount in wei/smallest unit as string
	currency: string; // Currency symbol
	decimals: number; // Currency decimals
	contractAddress?: string; // For token transactions
	status: TxStatus;
	timestamp: number; // Unix timestamp
	networkId: string; // Network GUID
	chainId: number; // Chain ID
	blockNumber?: number; // Block number (when confirmed)
	gasUsed?: string; // Gas used (when confirmed) as string
	error?: string; // Error message if failed
}

// Store for transaction log - keyed by network GUID
export const transactionLog = localStorageSharedStore<{ [networkId: string]: TxLogEntry[] }>('transaction_log', {});

/**
 * Generate a unique transaction ID
 */
function generateTxId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Convert TxLogEntry amount (string) to BigInt for calculations
 */
export function getTxAmountAsBigInt(tx: TxLogEntry): bigint {
	return BigInt(tx.amount);
}

/**
 * Convert TxLogEntry gasUsed (string) to BigInt for calculations
 */
export function getTxGasUsedAsBigInt(tx: TxLogEntry): bigint | undefined {
	return tx.gasUsed ? BigInt(tx.gasUsed) : undefined;
}

/**
 * Add a new transaction to the log
 */
export function addTransactionToLog(address: string, amount: bigint, currency: string, decimals: number, contractAddress?: string, hash?: string): string {
	const network = get(selectedNetwork);
	if (!network) {
		throw new Error('No network selected');
	}

	const txId = generateTxId();
	const newTx: TxLogEntry = {
		id: txId,
		hash,
		address,
		amount: amount.toString(), // Convert BigInt to string
		currency,
		decimals,
		contractAddress,
		status: hash ? 'Pending' : 'Not sent',
		timestamp: Date.now(),
		networkId: network.guid!,
		chainId: network.chainID!,
	};

	transactionLog.update(log => {
		if (!log[network.guid!]) {
			log[network.guid!] = [];
		}
		// Add to beginning of array (newest first)
		log[network.guid!].unshift(newTx);
		return log;
	});

	return txId;
}

/**
 * Update transaction status
 */
export function updateTransactionStatus(txId: string, status: TxStatus, hash?: string, blockNumber?: number, gasUsed?: bigint, error?: string): void {
	console.log('🔄 Updating transaction status:', { txId, status, hash, blockNumber, gasUsed: gasUsed?.toString(), error });

	const network = get(selectedNetwork);
	if (!network) {
		console.error('No network selected for transaction update');
		return;
	}

	transactionLog.update(log => {
		const networkLog = log[network.guid!];
		if (!networkLog) {
			console.error('No transactions found for network:', network.guid);
			return log;
		}

		const txIndex = networkLog.findIndex(tx => tx.id === txId);
		if (txIndex === -1) {
			console.error('Transaction not found:', txId);
			return log;
		}

		const tx = networkLog[txIndex];
		console.log('📝 Before update:', { id: tx.id, status: tx.status, hash: tx.hash });

		// Create a new transaction object (immutable update)
		const updatedTx: TxLogEntry = {
			...tx,
			status,
			hash: hash || tx.hash,
			blockNumber: blockNumber || tx.blockNumber,
			gasUsed: gasUsed ? gasUsed.toString() : tx.gasUsed,
			error: error || tx.error,
		};

		console.log('✅ After update:', { id: updatedTx.id, status: updatedTx.status, hash: updatedTx.hash, blockNumber: updatedTx.blockNumber });

		// Create new array with updated transaction
		const newNetworkLog = [...networkLog];
		newNetworkLog[txIndex] = updatedTx;

		// Create completely new log object
		const newLog = {
			...log,
			[network.guid!]: newNetworkLog,
		};

		console.log('🔄 Store updated with new log object');
		return newLog;
	});
}

/**
 * Get transactions for current network
 */
export function getCurrentNetworkTransactions(): TxLogEntry[] {
	const network = get(selectedNetwork);
	if (!network) return [];

	const log = get(transactionLog);
	return log[network.guid!] || [];
}

/**
 * Refresh transaction status from blockchain
 */
export async function refreshTransactionStatus(txId: string): Promise<void> {
	console.log('🔄 Refreshing transaction status for:', txId);

	const network = get(selectedNetwork);
	if (!network) {
		console.error('No network selected for transaction refresh');
		return;
	}

	const log = get(transactionLog);
	const networkLog = log[network.guid!];
	if (!networkLog) {
		console.error('No transactions found for network:', network.guid);
		return;
	}

	const tx = networkLog.find(t => t.id === txId);
	if (!tx || !tx.hash) {
		console.error('Transaction not found or no hash available:', txId);
		return;
	}

	console.log('🔍 Checking transaction:', { id: txId, hash: tx.hash, currentStatus: tx.status });

	try {
		const currentProvider = get(provider);
		if (!currentProvider) {
			console.error('No provider available');
			return;
		}

		console.log('📡 Getting transaction receipt for hash:', tx.hash);

		// Get transaction receipt
		const receipt = await currentProvider.getTransactionReceipt(tx.hash);

		console.log('📋 Receipt received:', receipt);

		if (receipt) {
			// Transaction is confirmed
			const status: TxStatus = receipt.status === 1 ? 'Success' : 'Error';
			console.log('✅ Transaction confirmed with status:', status, 'Receipt status:', receipt.status);

			updateTransactionStatus(txId, status, tx.hash, receipt.blockNumber, receipt.gasUsed, receipt.status === 0 ? 'Transaction failed' : undefined);

			console.log('🔄 Forcing store notification...');
			// Force store notification by triggering reactivity
			transactionLog.update(log => ({ ...log }));
		} else {
			console.log('⏳ No receipt yet, checking if transaction exists...');
			// Check if transaction exists but is not confirmed yet
			const txResponse = await currentProvider.getTransaction(tx.hash);
			if (txResponse) {
				console.log('🔄 Transaction exists but not confirmed yet');
				// Transaction exists but not confirmed yet
				updateTransactionStatus(txId, 'Pending');
			} else {
				console.log('❌ Transaction not found on blockchain');
				// Transaction not found - might have been dropped
				updateTransactionStatus(txId, 'Error', tx.hash, undefined, undefined, 'Transaction not found');
			}

			console.log('🔄 Forcing store notification...');
			// Force store notification by triggering reactivity
			transactionLog.update(log => ({ ...log }));
		}
	} catch (error) {
		console.error('❌ Error refreshing transaction status:', error);
		updateTransactionStatus(txId, 'Error', tx.hash, undefined, undefined, error instanceof Error ? error.message : 'Unknown error');

		console.log('🔄 Forcing store notification after error...');
		// Force store notification by triggering reactivity
		transactionLog.update(log => ({ ...log }));
	}
}

/**
 * Clear all transactions for current network
 */
export function clearCurrentNetworkTransactions(): void {
	const network = get(selectedNetwork);
	if (!network) return;

	transactionLog.update(log => {
		delete log[network.guid!];
		return log;
	});
}

/**
 * Remove a specific transaction
 */
export function removeTransaction(txId: string): void {
	const network = get(selectedNetwork);
	if (!network) return;

	transactionLog.update(log => {
		const networkLog = log[network.guid!];
		if (!networkLog) return log;

		const txIndex = networkLog.findIndex(tx => tx.id === txId);
		if (txIndex !== -1) {
			networkLog.splice(txIndex, 1);
		}
		return log;
	});
}
