import { get } from 'svelte/store';
import { Contract } from 'ethers';
import TrezorConnect from '@trezor/connect-web';
import type { IAddress, IWallet } from './wallet.ts';
// ensureTrezorState should be called by UI component before calling sendTransactionTrezor
import { provider } from './provider.ts';
import { selectedNetwork } from './network.ts';
import { withTrezorState, withTimeout } from './trezor.ts';

export async function sendTransactionTrezor(wallet: IWallet, srcAddress: IAddress, dstAddress: string, amount: bigint, fee: bigint, contractAddress?: string): Promise<void> {
	// Validate inputs
	if (!wallet || !srcAddress || !dstAddress || amount <= 0n) {
		throw new Error('Invalid transaction parameters');
	}

	// Ensure Trezor state is available
	// ensureTrezorState should be called by UI component before this function

	return await withTrezorState(async () => {
		// Get provider for nonce and gas estimation
		const providerInstance = get(provider);
		if (!providerInstance) {
			throw new Error('No provider available');
		}

		const network = get(selectedNetwork);
		if (!network) {
			throw new Error('No network selected');
		}

		console.log('Preparing Trezor transaction...');
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

		// Prepare transaction parameters for Trezor
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

		console.log('Trezor transaction parameters:', txParams);

		// Sign transaction with Trezor
		const result = await withTimeout(
			TrezorConnect.ethereumSignTransaction({
				path: srcAddress.path,
				transaction: txParams,
				device: {
					path: wallet.identifiers?.path,
					state: wallet.identifiers?.staticSessionId,
				},
			}),
			60000 // 60 second timeout
		);

		console.log('Trezor signing result:', result);

		if (!result.success) {
			const errorMessage = result.payload?.error || 'Transaction signing failed';
			console.error('Trezor transaction signing failed:', errorMessage);
			throw new Error(`Trezor signing failed: ${errorMessage}`);
		}

		// Broadcast the signed transaction
		const signedTx = result.payload;
		console.log('Broadcasting signed transaction:', signedTx);

		try {
			const txResponse = await providerInstance.broadcastTransaction(signedTx.serializedTx);
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
	});
}
