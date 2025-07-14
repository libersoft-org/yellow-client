import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import { Mnemonic, HDNodeWallet, parseUnits, formatUnits, type PreparedTransactionRequest } from 'ethers';
import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
import { selectedWallet, selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
export interface IPayment {
	address: string;
	amount: bigint;
	fee: bigint;
	currency: string | null | undefined;
}

export interface FeeEstimate {
	low: string;
	average: string;
	high: string;
}

export interface TransactionTimeEstimate {
	low: string;
	average: string;
	high: string;
}

let estimatedFee: FeeEstimate = {
	low: '0',
	average: '0',
	high: '0',
};

let estimatedTransactionTimes: TransactionTimeEstimate = {
	low: 'unknown',
	average: 'unknown',
	high: 'unknown',
};

export const feeLoading = writable(false);
export const transactionTimeLoading = writable(false);
export const feeLevel = writable<'low' | 'average' | 'high' | 'custom'>('average');
export const fee = writable<string | number>('0');
export const transactionTime = writable<string>('unknown');

export function getEtherAmount(amount) {
	try {
		let etherAmount: bigint = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
		return etherAmount;
	} catch (e) {
		return null;
	}
}

export async function estimateTransactionFee(): Promise<{ low: string; average: string; high: string } | null> {
	const providerInstance = get(provider);
	if (!providerInstance || !get(selectedNetwork) || !get(selectedAddress)) {
		console.log('estimateTransactionFee: Missing requirements');
		return null;
	}
	console.log('estimateTransactionFee: Starting estimation');
	feeLoading.set(true);
	try {
		const feeData = await providerInstance.getFeeData();
		const gasLimit = 21000n;
		let maxFeePerGas = feeData.maxFeePerGas;
		let gasPrice = feeData.gasPrice;
		let lowFee: bigint = 0n;
		let averageFee: bigint = 0n;
		let highFee: bigint = 0n;
		if (maxFeePerGas && feeData.maxPriorityFeePerGas) {
			const baseFee = maxFeePerGas - feeData.maxPriorityFeePerGas;
			const lowPriorityFee = (feeData.maxPriorityFeePerGas * 50n) / 100n;
			lowFee = (baseFee + lowPriorityFee) * gasLimit;
			averageFee = maxFeePerGas * gasLimit;
			const highPriorityFee = (feeData.maxPriorityFeePerGas * 150n) / 100n;
			highFee = (baseFee + highPriorityFee) * gasLimit;
		} else if (gasPrice) {
			lowFee = ((gasPrice * 80n) / 100n) * gasLimit; // 80% of current gas price
			averageFee = gasPrice * gasLimit; // Current gas price
			highFee = ((gasPrice * 150n) / 100n) * gasLimit; // 150% of current gas price
		}
		const fees = {
			low: formatUnits(lowFee, 18),
			average: formatUnits(averageFee, 18),
			high: formatUnits(highFee, 18),
		};
		estimatedFee = fees;
		console.log('estimatedFee set to:', estimatedFee);
		// Update transaction time based on real data (asynchronously)
		transactionTimeLoading.set(true);
		updateTransactionTimes()
			.catch(error => {
				console.error('Error updating transaction times (non-blocking):', error);
			})
			.finally(() => {
				transactionTimeLoading.set(false);
			});
		updateFeeFromLevel();
		console.log('estimateTransactionFee: Completed, returning:', fees);
		return fees;
	} catch (e) {
		console.error('Error estimating transaction fee:', e);
		return null;
	} finally {
		feeLoading.set(false);
	}
}

export function updateFeeFromLevel() {
	const currentFeeLevel = get(feeLevel);
	console.log('updateFeeFromLevel called with:', currentFeeLevel, 'estimatedFee:', estimatedFee);
	if (currentFeeLevel === 'custom') {
		// For custom, don't update fee but update transaction time based on current fee
		transactionTime.set(getEstimatedTransactionTime('custom'));
		return;
	}
	fee.set(estimatedFee[currentFeeLevel]);
	transactionTime.set(getEstimatedTransactionTime(currentFeeLevel));
	console.log('Updated fee to:', get(fee), 'time to:', get(transactionTime));
}

export function getEstimatedTransactionTime(feeLevel: 'low' | 'average' | 'high' | 'custom'): string {
	if (feeLevel === 'custom') {
		// Calculate custom time based on fee amount
		const customFee = parseFloat(get(fee).toString());
		const lowFee = parseFloat(estimatedFee.low);
		const averageFee = parseFloat(estimatedFee.average);
		const highFee = parseFloat(estimatedFee.high);
		// If we don't have valid fee data or times, return unknown
		if (!customFee || !lowFee || !averageFee || !highFee || estimatedTransactionTimes.low === 'unknown' || estimatedTransactionTimes.average === 'unknown' || estimatedTransactionTimes.high === 'unknown') return 'unknown';
		// Determine which range the custom fee falls into
		if (customFee >= highFee) return estimatedTransactionTimes.high;
		else if (customFee >= averageFee) {
			// Interpolate between average and high
			const ratio = (customFee - averageFee) / (highFee - averageFee);
			return interpolateTransactionTime(estimatedTransactionTimes.average, estimatedTransactionTimes.high, ratio);
		} else if (customFee >= lowFee) {
			// Interpolate between low and average
			const ratio = (customFee - lowFee) / (averageFee - lowFee);
			return interpolateTransactionTime(estimatedTransactionTimes.low, estimatedTransactionTimes.average, ratio);
		} else {
			// Custom fee is lower than low fee, estimate longer time
			return estimatedTransactionTimes.low;
		}
	}
	return estimatedTransactionTimes[feeLevel];
}

export function updateCustomFeeTransactionTime() {
	const currentFeeLevel = get(feeLevel);
	if (currentFeeLevel === 'custom') {
		transactionTime.set(getEstimatedTransactionTime('custom'));
		console.log('Updated custom fee transaction time to:', get(transactionTime));
	}
}

async function updateTransactionTimes(): Promise<void> {
	const providerInstance = get(provider);
	const network = get(selectedNetwork);
	// Keep existing values as "unknown" if no provider/network
	if (!providerInstance || !network) return;
	try {
		// Timeout for the entire operation
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Timeout')), 5000); // 5 second timeout
		});
		const analysisPromise = (async () => {
			// Get last 5 blocks for faster analysis
			const blockCount = 5;
			const latest = await providerInstance.getBlockNumber();
			// Parallel fetching of fee history and blocks
			const [feeHistoryResult, ...blockResults] = await Promise.all([providerInstance.send('eth_feeHistory', [`0x${blockCount.toString(16)}`, 'latest', [10, 50, 90]]).catch(() => null), ...Array.from({ length: blockCount }, (_, i) => providerInstance.getBlock(latest - i).catch(() => null))]);
			// Block time analysis - require at least 3 valid blocks for accuracy
			const blockTimes: number[] = [];
			const validBlocks = blockResults.filter(block => block && block.timestamp);
			// Not enough blocks for accurate calculation
			if (validBlocks.length < 3) return null;
			for (let i = 0; i < validBlocks.length - 1; i++) {
				const currentBlock = validBlocks[i];
				const previousBlock = validBlocks[i + 1];
				if (currentBlock && previousBlock) {
					const blockTime = currentBlock.timestamp - previousBlock.timestamp;
					// reasonable limits
					if (blockTime > 0 && blockTime < 300) blockTimes.push(blockTime);
				}
			}
			// Require at least 2 valid block times for accurate average
			if (blockTimes.length < 2) return null;
			// Calculate precise average block time
			const avgBlockTime = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
			// Confirmation estimate based on real data
			const confirmationBlocks = estimateConfirmationBlocks(feeHistoryResult, avgBlockTime);
			// Only return if we have valid confirmation blocks
			if (!confirmationBlocks) return null;
			return {
				low: formatTransactionTime(confirmationBlocks.low * avgBlockTime),
				average: formatTransactionTime(confirmationBlocks.average * avgBlockTime),
				high: formatTransactionTime(confirmationBlocks.high * avgBlockTime),
			};
		})();
		// Either analysis completion or timeout
		const result = await Promise.race([analysisPromise, timeoutPromise]);
		// Only update if we got precise results
		if (result) {
			estimatedTransactionTimes = result;
			// Update the transaction time store after getting new data
			const currentFeeLevel = get(feeLevel);
			if (currentFeeLevel !== 'custom') transactionTime.set(estimatedTransactionTimes[currentFeeLevel]);
		}
		// If result is null, keep existing "unknown" values
	} catch (error) {
		console.error('Error updating transaction times:', error);
		// Keep existing "unknown" values, don't override with inaccurate data
	}
}

function estimateConfirmationBlocks(feeHistory: any, avgBlockTime: number): { low: number; average: number; high: number } | null {
	// Return null if no fee history data - we need this for accurate estimation
	if (!feeHistory || !feeHistory.reward || !Array.isArray(feeHistory.reward) || feeHistory.reward.length === 0) return null;
	try {
		// Fee percentile analysis from fee history
		const rewards = feeHistory.reward;
		const validRewards = rewards.filter((reward: any) => reward && Array.isArray(reward) && reward.length >= 3);
		// Need at least 3 valid rewards for accurate estimation
		if (validRewards.length < 3) return null;
		// Calculate average percentiles
		const avgPercentiles = validRewards
			.reduce(
				(acc: number[], reward: any) => {
					return [acc[0] + (parseInt(reward[0] || '0', 16) || 0), acc[1] + (parseInt(reward[1] || '0', 16) || 0), acc[2] + (parseInt(reward[2] || '0', 16) || 0)];
				},
				[0, 0, 0]
			)
			.map(sum => sum / validRewards.length);
		// Estimate based on real data
		const [, avgPercentile] = avgPercentiles;
		// Network congestion in gwei
		const networkCongestion = avgPercentile / 1000000000 || 1;
		// Dynamic calculation based on network congestion and block time
		const baseConfirmations = Math.max(1, Math.ceil(30 / avgBlockTime)); // Target ~30 seconds for high priority
		if (networkCongestion < 5)
			return {
				low: baseConfirmations * 2,
				average: baseConfirmations,
				high: baseConfirmations,
			};
		else if (networkCongestion < 20)
			return {
				low: baseConfirmations * 3,
				average: baseConfirmations * 2,
				high: baseConfirmations,
			};
		else if (networkCongestion < 50)
			return {
				low: baseConfirmations * 4,
				average: baseConfirmations * 3,
				high: baseConfirmations,
			};
		else
			return {
				low: baseConfirmations * 6,
				average: baseConfirmations * 4,
				high: baseConfirmations * 2,
			};
	} catch (error) {
		console.error('Error in estimateConfirmationBlocks:', error);
		return null; // Return null on error instead of fallback
	}
}

function formatTransactionTime(seconds: number): string {
	if (seconds < 60) return `~${Math.round(seconds)}s`;
	else if (seconds < 3600) {
		const minutes = Math.round(seconds / 60);
		return `~${minutes} min`;
	} else {
		const hours = Math.round(seconds / 3600);
		return `~${hours} h`;
	}
}

export async function sendTransaction(address: string, etherValue: bigint, etherValueFee: string, currency: string): Promise<void> {
	const selectedWalletValue = get(selectedWallet);
	const selectedAddressValue = get(selectedAddress);
	if (!selectedWalletValue || !selectedAddressValue) {
		console.error('No selected wallet or address');
		return;
	}
	const mn = Mnemonic.fromPhrase(selectedWalletValue.phrase);
	let hd_wallet = HDNodeWallet.fromMnemonic(mn, selectedAddressValue.path).connect(get(provider));
	let data = 'you can put data here';
	const request: PreparedTransactionRequest = {
		to: address,
		from: selectedAddressValue.address,
		value: etherValue,
		//new Uint8Array(data.split('').map(c => c.charCodeAt(0))),
		data: data,
	};
	//maxFeePerGas: etherValueFee,
	//nonce: await provider.getTransactionCount(selectedAddressValue.address),
	console.log('selectedAddressValue.address:', selectedAddressValue);
	console.log('provider:', get(provider));
	console.log('mn:', mn);
	console.log('hd_wallet:', hd_wallet);
	console.log('tx request:', request);
	console.log('hd_wallet.estimateGas:');
	let eg = await hd_wallet.estimateGas(request);
	console.log('estimateGas:', eg);
	console.log('hd_wallet.sendTransaction:');
	let tx = await hd_wallet.sendTransaction(request);
	console.log('wait..', tx);
	await tx.wait();
	console.log('Transaction sent OK');
	/*
	let log = {
		dir: 'sent',
		date: new Date(),
		from: request.from,
		to: request.to,
		currency: currency,
		hash: tx.hash,
		chainID: tx.chainId.toString(),
		nonce: tx.nonce,
		tx_type: tx.type,
		estimatedGas: formatEther(eg),
		gasLimit: formatEther(tx.gasLimit),
		gasPrice: formatEther(tx.gasPrice),
		value: formatEther(tx.value),
	};
	console.log('log:', log);
	console.log('log:', JSON.stringify(log));
	if (!selectedWalletValue.log) selectedWalletValue.log = [];
	selectedWalletValue.log.push(log);
	wallets.update(w => w);
*/
	/*
} catch (error) {
	console.error('Error while sending a transaction:', error);
}
*/
}

function interpolateTransactionTime(timeA: string, timeB: string, ratio: number): string {
	// Parse time strings (e.g., "~30s", "~2 min", "~1 h")
	const parseTime = (timeStr: string): number => {
		const match = timeStr.match(/~(\d+)\s*(s|min|h)/);
		if (!match) return 0;
		const value = parseInt(match[1]);
		const unit = match[2];
		switch (unit) {
			case 's':
				return value;
			case 'min':
				return value * 60;
			case 'h':
				return value * 3600;
			default:
				return value;
		}
	};
	const secondsA = parseTime(timeA);
	const secondsB = parseTime(timeB);
	if (secondsA === 0 || secondsB === 0) return timeA; // fallback
	// Interpolate between the two times
	const interpolatedSeconds = secondsA + (secondsB - secondsA) * ratio;
	return formatTransactionTime(interpolatedSeconds);
}
