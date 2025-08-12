import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import { Mnemonic, HDNodeWallet, parseUnits, formatUnits, Contract, type PreparedTransactionRequest, type TransactionReceipt } from 'ethers';
import { ensureProviderConnected, provider, reconnect, status } from './provider.ts';
import { selectedNetwork } from './network.ts';
import { selectedWallet, selectedAddress } from './wallet.ts';
import { sendTransactionTrezor } from './trezor-transaction.ts';
import { sendTransactionLedger } from './ledger-transaction.ts';

export interface IPayment {
	address: string;
	amount: bigint;
	fee: bigint;
	symbol: string | null | undefined;
	contractAddress?: string; // For tokens - undefined for native currency
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
export let estimatedTransactionTimes = writable<TransactionTimeEstimate>({
	low: 'unknown',
	average: 'unknown',
	high: 'unknown',
});
export const feeLoading = writable(false);
export const transactionTimeLoading = writable(false);
export const feeLevel = writable<'low' | 'average' | 'high' | 'custom'>('average');
export const fee = writable<string | number>('0');
export const transactionTime = writable<string>('unknown');
export const avgBlockTimeStore = writable<any>();
export const confirmationBlocksStore = writable<any>();

transactionTime.subscribe(value => {
	console.log('transactionTime updated:', value);
});

export function getEtherAmount(amount: string | number): bigint | null {
	try {
		let etherAmount: bigint = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
		return etherAmount;
	} catch (e) {
		return null;
	}
}

export async function estimateTransactionFee(contractAddress?: string): Promise<{
	low: string;
	average: string;
	high: string;
} | null> {
	const providerInstance = get(provider);
	const selectedAddressValue = get(selectedAddress);
	if (!providerInstance || !get(selectedNetwork) || !selectedAddressValue) {
		console.log('estimateTransactionFee: Missing requirements');
		return null;
	}
	console.log('estimateTransactionFee: Starting estimation for', contractAddress ? 'token' : 'ETH', 'transaction');
	feeLoading.set(true);
	// Clear fee if not custom level
	const currentFeeLevel = get(feeLevel);
	if (currentFeeLevel !== 'custom') fee.set('');
	try {
		const feeData = await providerInstance.getFeeData();
		let gasLimit: bigint;

		// Determine appropriate gas limit
		if (contractAddress) {
			// For token transactions, estimate gas limit
			try {
				const mn = Mnemonic.fromPhrase(get(selectedWallet)?.phrase || '');
				const hd_wallet = HDNodeWallet.fromMnemonic(mn, selectedAddressValue.path).connect(providerInstance);
				const tokenContract = new Contract(contractAddress, ['function transfer(address to, uint256 amount) returns (bool)'], hd_wallet);
				// Use a dummy address and amount for estimation
				const dummyAddress = '0x0000000000000000000000000000000000000001';
				const dummyAmount = parseUnits('1', 18);
				gasLimit = await tokenContract.transfer.estimateGas(dummyAddress, dummyAmount);
				console.log('estimateTransactionFee: Estimated gas limit for token:', gasLimit.toString());
			} catch (error) {
				console.warn('estimateTransactionFee: Could not estimate token gas, using default 65000');
				gasLimit = 65000n; // Default for token transfers
			}
		} else {
			// For ETH transactions
			gasLimit = 21000n;
		}

		let maxFeePerGas = feeData.maxFeePerGas;
		let gasPrice = feeData.gasPrice;
		let lowFee: bigint = 0n;
		let averageFee: bigint = 0n;
		let highFee: bigint = 0n;
		// Use calculated gas limit
		const effectiveGasLimit = gasLimit;
		// Adaptive gas price multiplier based on network conditions
		let gasPriceMultiplier = 120n; // Default 120% (reduced from previous high values)
		// Check recent block congestion to adjust gas price
		try {
			const latestBlock = await providerInstance.getBlock('latest');
			if (latestBlock && latestBlock.gasUsed && latestBlock.gasLimit) {
				const gasUtilization = Number((latestBlock.gasUsed * 100n) / latestBlock.gasLimit);
				console.log('Network gas utilization:', gasUtilization + '%');
				// Adjust multiplier based on network congestion - more conservative values
				if (gasUtilization > 95) {
					gasPriceMultiplier = 150n; // 150% for very high congestion
					console.log('Very high network congestion detected, using 150% gas price');
				} else if (gasUtilization > 85) {
					gasPriceMultiplier = 140n; // 140% for high congestion
					console.log('High network congestion detected, using 140% gas price');
				} else if (gasUtilization > 70) {
					gasPriceMultiplier = 130n; // 130% for medium congestion
					console.log('Medium network congestion detected, using 130% gas price');
				} else {
					console.log('Normal network congestion, using 120% gas price');
				}
			}
		} catch (blockError) {
			console.warn('Could not check network congestion, using default gas price:', blockError);
		}
		if (maxFeePerGas && feeData.maxPriorityFeePerGas) {
			const baseFee = maxFeePerGas - feeData.maxPriorityFeePerGas;
			const lowPriorityFee = (feeData.maxPriorityFeePerGas * 75n) / 100n; // Increased from 50%
			lowFee = (baseFee + lowPriorityFee) * effectiveGasLimit;
			averageFee = ((maxFeePerGas * gasPriceMultiplier) / 100n) * effectiveGasLimit; // Increased
			const highPriorityFee = (feeData.maxPriorityFeePerGas * 200n) / 100n; // Increased from 150%
			highFee = (baseFee + highPriorityFee) * effectiveGasLimit;
		} else if (gasPrice) {
			lowFee = ((gasPrice * 100n) / 100n) * effectiveGasLimit; // Increased from 80%
			averageFee = ((gasPrice * gasPriceMultiplier) / 100n) * effectiveGasLimit; // Increased
			highFee = ((gasPrice * 200n) / 100n) * effectiveGasLimit; // Increased from 150%
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
	if (currentFeeLevel !== 'custom') {
		fee.set(estimatedFee[currentFeeLevel]);
		console.log('Updated fee to:', get(fee));
	}
	console.log('updateFeeFromLevel: Update estimated transaction time to:', get(transactionTime));
	transactionTime.set(getEstimatedTransactionTime(currentFeeLevel));
}

export function getEstimatedTransactionTime(feeLevel: 'low' | 'average' | 'high' | 'custom'): string {
	if (feeLevel === 'custom') {
		// Calculate custom time based on fee amount
		const customFee = parseFloat(get(fee).toString());
		const lowFee = parseFloat(estimatedFee.low);
		const averageFee = parseFloat(estimatedFee.average);
		const highFee = parseFloat(estimatedFee.high);
		const currentEstimatedTimes = get(estimatedTransactionTimes);
		// If we don't have valid fee data or times, return unknown
		if (!customFee || !lowFee || !averageFee || !highFee || currentEstimatedTimes.low === 'unknown' || currentEstimatedTimes.average === 'unknown' || currentEstimatedTimes.high === 'unknown') return 'unknown';
		// Determine which range the custom fee falls into
		if (customFee >= highFee) return currentEstimatedTimes.high;
		else if (customFee >= averageFee) {
			// Interpolate between average and high
			const ratio = (customFee - averageFee) / (highFee - averageFee);
			return interpolateTransactionTime(currentEstimatedTimes.average, currentEstimatedTimes.high, ratio);
		} else if (customFee >= lowFee) {
			// Interpolate between low and average
			const ratio = (customFee - lowFee) / (averageFee - lowFee);
			return interpolateTransactionTime(currentEstimatedTimes.low, currentEstimatedTimes.average, ratio);
		} else {
			// Custom fee is lower than low fee, estimate longer time
			return currentEstimatedTimes.low;
		}
	}
	return get(estimatedTransactionTimes)[feeLevel];
}

async function updateTransactionTimes(): Promise<void> {
	const providerInstance = get(provider);
	const network = get(selectedNetwork);
	// Keep existing values as "unknown" if no provider/network
	if (!providerInstance || !network) return;
	try {
		// Timeout for the entire operation
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Timeout')), 25000); // 5 second timeout
		});
		const analysisPromise = (async () => {
			// Get last 5 blocks for faster analysis
			const blockCount = 5;
			const latest = await providerInstance.getBlockNumber();

			// Parallel fetching of fee history and blocks
			const [feeHistoryResult, ...blockResults] = await Promise.all([
				(async () => {
					try {
						console.debug('Fetching eth_feeHistory for last', blockCount, 'blocks');
						const r = await providerInstance.send('eth_feeHistory', [`0x${blockCount.toString(16)}`, 'latest', [10, 50, 90]]);
						console.debug('eth_feeHistory result:', r);
						return r;
					} catch (error) {
						console.debug('Error fetching eth_feeHistory:', error);
						return null;
					}
				})(),

				...Array.from({ length: blockCount }, (_, i) => {
					console.debug(`Fetching block ${latest - i}`);
					return providerInstance
						.getBlock(latest - i)
						.then(block => {
							console.debug(`Block ${latest - i} fetched:`, block);
							return block;
						})
						.catch(error => {
							console.debug(`Error fetching block ${latest - i}:`, error);
							return null; // Return null for failed blocks
						});
				}),
			]);
			console.debug('...');
			console.debug('Fee history result:', feeHistoryResult);
			console.debug('Block results:', blockResults);
			// Block time analysis - require at least 3 valid blocks for accuracy
			const blockTimes: number[] = [];
			const validBlocks = blockResults.filter(block => block && block.timestamp);
			console.debug('Valid blocks:', validBlocks.length, validBlocks);
			// Not enough blocks for accurate calculation
			if (validBlocks.length < 3) {
				console.debug('Not enough valid blocks for accurate transaction time estimation');
				return null;
			}
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
			if (blockTimes.length < 2) {
				console.debug('Not enough valid block times for accurate transaction time estimation');
				return null;
			}
			// Calculate precise average block time
			const avgBlockTime = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
			avgBlockTimeStore.set(avgBlockTime);
			console.debug('Average block time calculated:', avgBlockTime, 'seconds');
			// Confirmation estimate based on real data
			const confirmationBlocks = estimateConfirmationBlocks(feeHistoryResult, avgBlockTime);
			confirmationBlocksStore.set(confirmationBlocks);
			// Only return if we have valid confirmation blocks
			if (!confirmationBlocks) {
				console.debug('No valid confirmation blocks estimated from fee history');
				return null;
			}
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
			estimatedTransactionTimes.set(result);
			// Update the transaction time store after getting new data
			const currentFeeLevel = get(feeLevel);
			if (currentFeeLevel !== 'custom') {
				console.debug('updateTransactionTimes: Updating transaction time for fee level:', currentFeeLevel, 'to:', result[currentFeeLevel]);
				transactionTime.set(result[currentFeeLevel]);
			}
		}
		// If result is null, keep existing "unknown" values
	} catch (error) {
		console.error('Error updating transaction times:', error);
		// Keep existing "unknown" values, don't override with inaccurate data
	}
}

function estimateConfirmationBlocks(
	feeHistory: any,
	avgBlockTime: number
): {
	low: number;
	average: number;
	high: number;
} | null {
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
			.map((sum: number) => sum / validRewards.length);
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

export async function sendTransaction(address: string, etherValue: bigint, etherValueFee: bigint, contractAddress?: string): Promise<void> {
	const selectedWalletValue = get(selectedWallet);
	const selectedAddressValue = get(selectedAddress);
	console.log('sendTransaction debug - selectedWalletValue:', selectedWalletValue);
	console.log('sendTransaction debug - selectedAddressValue:', selectedAddressValue);
	console.log('sendTransaction debug - wallet type:', selectedWalletValue?.type);
	console.log('sendTransaction debug - wallet has phrase:', !!selectedWalletValue?.phrase);
	if (!selectedWalletValue || !selectedAddressValue) {
		console.error('No selected wallet or address');
		return;
	}

	console.log('selectedWalletValue.type:', selectedWalletValue.type);
	if (selectedWalletValue.type === 'software') {
		await sendTransactionSw(selectedWalletValue, selectedAddressValue, address, etherValue, etherValueFee, contractAddress);
	} else if (selectedWalletValue.type === 'trezor') {
		await sendTransactionTrezor(selectedWalletValue, selectedAddressValue, address, etherValue, etherValueFee, contractAddress);
	} else if (selectedWalletValue.type === 'ledger') {
		await sendTransactionLedger(selectedWalletValue, selectedAddressValue, address, etherValue, etherValueFee, contractAddress);
	} else {
		console.error('Unknown wallet type:', selectedWalletValue.type);
		throw new Error('Invalid wallet configuration');
	}

	/*
	let log = {
		dir: 'sent',
		date: new Date(),
		from: request.from,
		to: request.to,
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
}

async function sendTransactionSw(selectedWalletValue: any, selectedAddressValue: any, address: string, etherValue: bigint, etherValueFee: bigint, contractAddress?: string) {
	// Check provider connection and attempt to reconnect if needed
	let providerInstance = await ensureProviderConnected();
	if (!providerInstance) {
		throw new Error('Failed to connect to provider');
	}

	if (!selectedWalletValue.phrase) {
		throw new Error('Software wallet configuration error: missing mnemonic phrase');
	}

	const mn = Mnemonic.fromPhrase(selectedWalletValue.phrase);
	let hd_wallet = HDNodeWallet.fromMnemonic(mn, selectedAddressValue.path).connect(providerInstance);
	let request: PreparedTransactionRequest;
	if (contractAddress) {
		// Token transaction - call transfer method on the token contract
		const tokenContract = new Contract(contractAddress, ['function transfer(address to, uint256 amount) returns (bool)'], hd_wallet);
		const transferData = tokenContract.interface.encodeFunctionData('transfer', [address, etherValue]);
		request = {
			to: contractAddress,
			from: selectedAddressValue.address,
			value: 0n, // No ETH value for token transfers
			data: transferData,
		};
	} else {
		// Native currency transaction (ETH)
		request = {
			to: address,
			from: selectedAddressValue.address,
			value: etherValue,
		};
	}
	//
	//nonce: await provider.getTransactionCount(selectedAddressValue.address),
	console.log('selectedAddressValue.address:', selectedAddressValue);
	console.log('provider:', providerInstance);
	// Get and set proper nonce to avoid conflicts
	// Use 'latest' instead of 'pending' to get confirmed nonce, then check for pending transactions
	const confirmedNonce = await providerInstance.getTransactionCount(selectedAddressValue.address, 'latest');
	const pendingNonce = await providerInstance.getTransactionCount(selectedAddressValue.address, 'pending');

	console.log('📊 Confirmed nonce for address:', confirmedNonce);
	console.log('📊 Pending nonce for address:', pendingNonce);

	// If there are pending transactions, we need to wait or use a higher nonce
	if (pendingNonce > confirmedNonce) {
		console.warn('⚠️ There are pending transactions! Confirmed:', confirmedNonce, 'Pending:', pendingNonce);
		console.warn('⚠️ This might cause nonce conflicts. Consider waiting for pending transactions to complete.');

		// Check if we should warn user about potential stuck transactions
		const pendingCount = pendingNonce - confirmedNonce;
		if (pendingCount > 3) {
			console.error('🚨 Warning: ' + pendingCount + ' pending transactions detected!');
			console.error('🚨 Your previous transactions might be stuck. Consider increasing gas price or waiting.');

			// Ask user if they want to use emergency mode (REPLACE stuck transaction)
			const useEmergencyMode = confirm(`🚨 STUCK TRANSACTIONS DETECTED! 🚨\n\n` + `You have ${pendingCount} pending transactions (nonce ${confirmedNonce}-${pendingNonce - 1}) blocking new transactions.\n\n` + `EMERGENCY MODE: Replace the FIRST stuck transaction (nonce ${confirmedNonce}) with this transaction using 3x gas price?\n\n` + `⚠️ This will REPLACE the stuck transaction and unblock the queue.\n` + `⚠️ This will cost more but should process faster.\n\n` + `Click OK for Emergency Replacement (3x gas price)\n` + `Click Cancel to abort transaction`);

			if (!useEmergencyMode) {
				throw new Error(`Transaction cancelled. You have ${pendingCount} stuck transactions blocking new ones.\n\nSolutions:\n1. Wait for pending transactions to complete\n2. Use Emergency Replacement Mode (3x gas price)\n3. Use a different wallet address`);
			}

			// Emergency mode: Use the FIRST stuck nonce with higher gas price
			console.log('🚨 EMERGENCY REPLACEMENT MODE ACTIVATED - Replacing stuck transaction with 3x gas price');
			request.nonce = confirmedNonce; // Use the FIRST stuck nonce to unblock queue

			// Increase gas price for faster processing
			if (request.maxFeePerGas) {
				request.maxFeePerGas = request.maxFeePerGas * 3n;
				request.maxPriorityFeePerGas = request.maxPriorityFeePerGas ? request.maxPriorityFeePerGas * 3n : request.maxFeePerGas / 2n;
			} else if (request.gasPrice) {
				request.gasPrice = request.gasPrice * 3n;
			}

			console.log('🚨 REPLACING stuck nonce:', confirmedNonce, 'with 3x gas price');
		} else {
			// Use the pending nonce to queue after existing pending transactions
			request.nonce = pendingNonce;
		}
	} else {
		// No pending transactions, use the confirmed nonce
		request.nonce = confirmedNonce;
	}

	console.log('📊 Using nonce:', request.nonce);
	console.log('mn:', mn);
	console.log('hd_wallet:', hd_wallet);
	console.log('tx request with nonce:', request);
	console.log('hd_wallet.estimateGas:');
	let eg = await hd_wallet.estimateGas(request);
	console.log('estimateGas:', eg);
	console.log('hd_wallet.sendTransaction:');
	let tx = await hd_wallet.sendTransaction(request);
	console.log('Transaction sent, hash:', tx.hash);
	console.log('Waiting for confirmation...');
	try {
		// Wait for transaction confirmation with timeout
		const receipt = await Promise.race([
			tx.wait() as Promise<TransactionReceipt>,
			new Promise<never>(
				(_, reject) => setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000) // 60 second timeout
			),
		]);
		console.log('Transaction confirmed:', receipt);
		console.log('Transaction sent OK');
	} catch (waitError) {
		console.warn('Transaction confirmation error or timeout:', waitError);
		console.log('Transaction was sent (hash: ' + tx.hash + ') but confirmation failed or timed out');
		// Don't throw error - transaction was sent successfully
	}
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
