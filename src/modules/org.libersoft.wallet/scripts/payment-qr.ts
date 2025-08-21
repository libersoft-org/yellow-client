import { formatUnits } from 'ethers';
import type { ICurrency } from 'libersoft-crypto/network';

export interface ParsedQRData {
	address?: string;
	amount?: string;
	currency?: ICurrency;
	chainID?: number;
	error?: string;
}

export function parseQRData(data: string, currencies: ICurrency[]): ParsedQRData {
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
			// ERC-20 token format
			const params = new URLSearchParams(remaining.slice('/transfer'.length));
			const address = params.get('address');
			const uint256 = params.get('uint256');

			if (!address) return { error: 'Missing address in token payment' };

			// Find currency by contract address
			const tokenCurrency = currencies.find(c => c.contract_address === target);
			if (!tokenCurrency) {
				return { error: `Token ${target} not found in current network` };
			}

			let amount: string | undefined;
			if (uint256) {
				// Convert from wei using token decimals (default 18 if not found)
				const decimals = 18; // We could look this up, but 18 is common default
				amount = formatUnits(uint256, decimals);
			}

			return { address, amount, currency: tokenCurrency, chainID: parsedChainID };
		} else if (remaining.startsWith('?')) {
			// Native currency format
			const params = new URLSearchParams(remaining);
			const value = params.get('value');

			// Find native currency
			const nativeCurrency = currencies.find(c => !c.contract_address);
			if (!nativeCurrency) {
				return { error: 'Native currency not found' };
			}

			let amount: string | undefined;
			if (value) {
				amount = formatUnits(value, 18);
			}

			return { address: target, amount, currency: nativeCurrency, chainID: parsedChainID };
		} else {
			// Just an address
			return { address: target, chainID: parsedChainID };
		}
	} catch (e) {
		return { error: 'Failed to parse QR code data' };
	}
}
