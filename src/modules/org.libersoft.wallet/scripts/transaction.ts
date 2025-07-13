import { get } from 'svelte/store';
import { Mnemonic, HDNodeWallet, type PreparedTransactionRequest } from 'ethers';
import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
import { selectedWallet, selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';

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
