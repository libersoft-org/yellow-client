import { get } from 'svelte/store';
import { Contract, Transaction } from 'ethers';
import type { IAddress, IWallet } from './wallet.ts';
import { provider } from './provider.ts';
import { selectedNetwork } from './network.ts';
import { signEthereumTransaction } from './ledger.ts';
// ensureLedgerState should be called by UI component before calling sendTransactionLedger

export async function sendTransactionLedger(wallet: IWallet, srcAddress: IAddress, dstAddress: string, amount: bigint, fee: bigint, contractAddress?: string): Promise<void> {
	// Validate inputs
	if (!wallet || !srcAddress || !dstAddress || amount <= 0n) {
		throw new Error('Invalid transaction parameters');
	}

	// Ensure Ledger state is available
	// ensureLedgerState should be called by UI component before this function

	// Get provider for nonce and gas estimation
	const providerInstance = get(provider);
	if (!providerInstance) {
		throw new Error('No provider available');
	}

	const network = get(selectedNetwork);
	if (!network) {
		throw new Error('No network selected');
	}

	console.log('Preparing Ledger transaction...');
	console.log('From:', srcAddress.address);
	console.log('To:', dstAddress);
	console.log('Amount:', amount.toString());
	console.log('Fee:', fee.toString());
	console.log('Contract:', contractAddress || 'ETH');

	// Get transaction count (nonce)
	const nonce = await providerInstance.getTransactionCount(srcAddress.address, 'pending');
	console.log('Transaction nonce:', nonce);

	// Get current gas price and fee data for EIP-1559 transaction
	const feeData = await providerInstance.getFeeData();
	let gasPrice = feeData.gasPrice;
	let maxFeePerGas = feeData.maxFeePerGas;
	let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

	// Calculate gas limit
	let gasLimit: string;
	let txData: string | undefined;

	if (contractAddress) {
		// Token transaction - estimate gas for contract call
		gasLimit = '0x' + 65000n.toString(16); // Standard token transfer gas limit
		// Encode transfer function call data
		const tokenInterface = new Contract(contractAddress, ['function transfer(address to, uint256 amount) returns (bool)']);
		txData = tokenInterface.interface.encodeFunctionData('transfer', [dstAddress, amount]);
	} else {
		// ETH transaction
		gasLimit = '0x' + 21000n.toString(16); // Standard ETH transfer gas limit
	}

	// Prepare transaction parameters for Ledger
	const txParams: any = {
		to: contractAddress || dstAddress,
		value: contractAddress ? 0n : amount, // Use bigint directly
		gasLimit: BigInt(gasLimit), // Convert to bigint
		nonce: nonce,
		chainId: network.chainID,
		data: txData || '0x',
	};

	// Use EIP-1559 transaction (type 2) when available, fallback to legacy
	if (maxFeePerGas && maxPriorityFeePerGas) {
		// EIP-1559 transaction (type 2) - modern gas pricing
		txParams.type = 2;
		txParams.maxFeePerGas = maxFeePerGas;
		txParams.maxPriorityFeePerGas = maxPriorityFeePerGas;

		console.log('Using EIP-1559 transaction with maxFeePerGas:', maxFeePerGas.toString(), 'maxPriorityFeePerGas:', maxPriorityFeePerGas.toString());
	} else if (gasPrice) {
		// Fallback to legacy transaction if EIP-1559 data not available
		// Don't set type field for legacy transactions (ethers.js will handle it)
		txParams.gasPrice = gasPrice;
		console.log('Using legacy transaction with gasPrice:', gasPrice.toString());
	} else {
		// If no gas data is available at all, use reasonable defaults for Polygon
		// Polygon typically has very low gas prices
		const defaultGasPrice = BigInt(30000000000); // 30 Gwei for Polygon
		txParams.gasPrice = defaultGasPrice;
		console.warn('No gas price data from provider, using default:', defaultGasPrice.toString());
	}

	console.log('Ledger transaction parameters:', txParams);
	console.log('Transaction type:', txParams.type || 'legacy (no type field)');
	console.log('Has gasPrice:', !!txParams.gasPrice);
	console.log('Has maxFeePerGas:', !!txParams.maxFeePerGas);

	// Sign transaction with Ledger
	console.log('Signing transaction with Ledger...');
	const signResult = await signEthereumTransaction(srcAddress.path, txParams);

	if (!signResult.success) {
		const errorMessage = signResult.error || 'Transaction signing failed';
		console.error('Ledger transaction signing failed:', errorMessage);
		throw new Error(`Ledger signing failed: ${errorMessage}`);
	}

	console.log('Ledger signing result:', signResult);

	// Reconstruct the signed transaction using ethers Transaction class
	const signature = signResult.payload;

	// Create transaction object with signature
	const signedTxData = {
		...txParams,
		signature: {
			r: signature.r,
			s: signature.s,
			v: signature.v,
		},
	};

	// Use ethers to serialize the signed transaction
	const tx = Transaction.from(signedTxData);
	const serializedTx = tx.serialized;

	console.log('Broadcasting signed transaction...');

	try {
		const txResponse = await providerInstance.broadcastTransaction(serializedTx);
		console.log('Transaction broadcast successful:', txResponse.hash);

		// Wait for confirmation with timeout
		try {
			const receipt = await Promise.race([txResponse.wait(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000))]);
			console.log('Transaction confirmed:', receipt);
		} catch (waitError) {
			console.warn('Transaction confirmation timeout:', waitError);
			console.log('Transaction was sent (hash: ' + txResponse.hash + ') but confirmation timed out');
			// Don't throw - transaction was sent successfully
		}
	} catch (broadcastError) {
		console.error('Failed to broadcast transaction:', broadcastError);
		throw new Error(`Failed to broadcast transaction: ${broadcastError instanceof Error ? broadcastError.message : 'Unknown error'}`);
	}
}
