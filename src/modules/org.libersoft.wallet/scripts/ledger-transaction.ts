import { get } from 'svelte/store';
import { Contract, Transaction } from 'ethers';
import type { IAddress, IWallet } from '@/org.libersoft.wallet/scripts/wallet.ts';
import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
import { signEthereumTransaction } from '@/org.libersoft.wallet/scripts/ledger.ts';

export async function sendTransactionLedger(wallet: IWallet, srcAddress: IAddress, dstAddress: string, amount: bigint, fee: bigint, contractAddress?: string): Promise<void> {
	// Validate inputs
	if (!wallet || !srcAddress || !dstAddress || amount <= 0n) {
		throw new Error('Invalid transaction parameters');
	}

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

	// Get current gas price and fee data
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
		value: contractAddress ? '0x0' : '0x' + amount.toString(16),
		gasLimit: gasLimit,
		nonce: '0x' + nonce.toString(16),
		chainId: network.chainID,
	};

	// Add transaction data for token transfers
	if (txData) {
		txParams.data = txData;
	}

	// Use EIP-1559 transaction if supported
	if (maxFeePerGas && maxPriorityFeePerGas) {
		txParams.maxFeePerGas = '0x' + maxFeePerGas.toString(16);
		txParams.maxPriorityFeePerGas = '0x' + maxPriorityFeePerGas.toString(16);
	} else if (gasPrice) {
		txParams.gasPrice = '0x' + gasPrice.toString(16);
	}

	console.log('Ledger transaction parameters:', txParams);

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
