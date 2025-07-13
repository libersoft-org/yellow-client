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
let estimatedFee = {
	low: '0',
	average: '0',
	high: '0',
};
export const feeLoading = writable(false);
export const feeLevel = writable<'low' | 'average' | 'high' | 'custom'>('average');
export const fee = writable<string | number>('0');

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
	if (!providerInstance || !get(selectedNetwork) || !get(selectedAddress)) return null;
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
		updateFeeFromLevel();
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
	if (currentFeeLevel === 'custom') return;
	fee.set(estimatedFee[currentFeeLevel]);
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
