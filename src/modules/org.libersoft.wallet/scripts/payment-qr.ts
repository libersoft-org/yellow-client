import { formatUnits } from 'ethers';
import type { ICurrency } from 'libersoft-crypto/network';

export interface ParsedQRData {
	address?: string;
	amount?: string;
	currency?: ICurrency;
	contractAddress?: string;
	chainID?: number;
	error?: string;
}

export function parseQRData(data: string): ParsedQRData {
	// Handle plain addresses
	if (!data.startsWith('ethereum:')) {
		return { address: data };
	}

	try {
		// Parse ethereum: URLs (ERC-681 format)
		// Format 1: ethereum:{address}@{chainID}?value={amount}
		// Format 2: ethereum:{contract_address}@{chainID}/transfer?address={address}&uint256={amount}

		const ethereumPrefix = 'ethereum:';
		let remaining = data.slice(ethereumPrefix.length);

		// Extract target (address or contract)
		const atIndex = remaining.indexOf('@');
		if (atIndex === -1) return { error: 'Invalid ethereum URL format' };

		const target = remaining.slice(0, atIndex);
		remaining = remaining.slice(atIndex + 1);

		// Extract chain ID
		const queryIndex = remaining.search(/[?/]/);
		let chainID: string;
		if (queryIndex === -1) {
			chainID = remaining;
			remaining = '';
		} else {
			chainID = remaining.slice(0, queryIndex);
			remaining = remaining.slice(queryIndex);
		}

		const parsedChainID = parseInt(chainID, 10);
		if (isNaN(parsedChainID)) {
			return { error: 'Invalid chain ID in QR code' };
		}

		if (remaining.startsWith('/transfer')) {
			const params = new URLSearchParams(remaining.slice('/transfer'.length));
			const address = params.get('address');
			const uint256 = params.get('uint256');
			const tokenId = params.get('tokenId');

			if (!address) return { error: 'Missing address in token/NFT payment' };

			if (tokenId) {
				// NFT format - uint256 represents quantity, tokenId is the specific NFT
				let amount: string | undefined;
				if (uint256) {
					// For NFTs, amount is already in integer format (no decimals)
					amount = uint256;
				}
				return { address, amount, contractAddress: target, chainID: parsedChainID };
			} else {
				// ERC-20 token format
				let amount: string | undefined;
				if (uint256) {
					// Convert from wei using token decimals (default 18 if not found)
					const decimals = 18; // We could look this up, but 18 is common default
					amount = formatUnits(uint256, decimals);
				}
				return { address, amount, contractAddress: target, chainID: parsedChainID };
			}
		} else if (remaining.startsWith('?')) {
			// Native currency format
			const params = new URLSearchParams(remaining);
			const value = params.get('value');

			let amount: string | undefined;
			if (value) {
				amount = formatUnits(value, 18);
			}

			return { address: target, amount, chainID: parsedChainID };
		} else {
			// Just an address
			return { address: target, chainID: parsedChainID };
		}
	} catch (e) {
		return { error: 'Failed to parse QR code data' };
	}
}

export interface PaymentURLOptions {
	address: string;
	chainID: number;
	currency?: ICurrency;
	amount?: bigint;
}

export function generatePaymentURL({ address, chainID, currency, amount }: PaymentURLOptions): string {
	if (currency?.type === 'native') {
		// Native currency payment (ETH) according to ERC-681
		// Format: ethereum:{address}@{chainID}?value={amount}
		return `ethereum:${address}@${chainID}${amount ? `?value=${amount.toString()}` : ''}`;
	} else if (currency?.type === 'token') {
		// ERC-20 token payment according to ERC-681
		// Format: ethereum:{contract_address}@{chainID}/transfer?address={address}&uint256={amount}
		return `ethereum:${currency.contract_address}@${chainID}/transfer?address=${address}${amount ? `&uint256=${amount.toString()}` : ''}`;
	} else if (currency?.type === 'nft') {
		// NFT payment according to ERC-681
		// For NFTs, the amount represents the quantity being transferred
		// Format: ethereum:{contract_address}@{chainID}/transfer?address={address}&uint256={amount}&tokenId={tokenId}
		const params = new URLSearchParams();
		params.set('address', address);
		if (amount) {
			params.set('uint256', amount.toString());
		}
		params.set('tokenId', currency.tokenId);
		return `ethereum:${currency.contract_address}@${chainID}/transfer?${params.toString()}`;
	} else {
		// Fallback for no currency
		return `ethereum:${address}@${chainID}`;
	}
}
