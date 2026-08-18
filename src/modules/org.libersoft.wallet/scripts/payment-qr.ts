import { formatUnits, getAddress, isAddress } from 'ethers';
import type { ICurrency } from 'libersoft-crypto/network';
export interface ParsedQRData {
	address?: string | undefined;
	amount?: string | undefined;
	rawAmount?: string | undefined;
	currency?: ICurrency | undefined;
	contractAddress?: string | undefined;
	chainID?: number | undefined;
	error?: string | undefined;
}

/* parseInt() would happily read "1xyz" as chain 1, so the whole string has to be digits. */
function parseChainId(value: string): number | null {
	if (!/^\d+$/.test(value)) return null;
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
	return parsed;
}

/** Returns the checksummed form of an address, or null when it is not a valid address at all. */
function normalizeAddress(value: string | null | undefined): string | null {
	if (!value || !isAddress(value)) return null;
	return getAddress(value);
}

export function parseQRData(data: string): ParsedQRData {
	// Handle plain addresses
	if (!data.startsWith('ethereum:')) {
		/* Anything that is not a valid address is refused rather than handed to the send form as a
		 * recipient - a scanned URL, a truncated address or a typo would otherwise be pre-filled and
		 * look like the scanner had understood it. */
		const plain = normalizeAddress(data.trim());
		return plain ? { address: plain } : { error: 'The scanned code is not a valid address' };
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
		const parsedChainID = parseChainId(chainID);
		if (parsedChainID === null) return { error: 'Invalid chain ID in QR code' };
		if (remaining.startsWith('/transfer')) {
			// ERC-20 token format
			const params = new URLSearchParams(remaining.slice('/transfer'.length));
			const address = normalizeAddress(params.get('address'));
			const contractAddress = normalizeAddress(target);
			const uint256 = params.get('uint256');
			if (!address) return { error: 'Missing or invalid address in token payment' };
			if (!contractAddress) return { error: 'Invalid token contract address in QR code' };
			if (uint256 && !/^\d+$/.test(uint256)) return { error: 'Invalid token amount in QR code' };
			// Don't convert token amount - decimals are unknown here (could be 6, 8, 18, etc.)
			// Return rawAmount and let the caller convert using actual token decimals
			return { address, rawAmount: uint256 || undefined, contractAddress, chainID: parsedChainID };
		} else if (remaining.startsWith('?')) {
			// Native currency format
			const params = new URLSearchParams(remaining);
			const value = params.get('value');
			let amount: string | undefined;
			if (value) {
				if (!/^\d+$/.test(value)) return { error: 'Invalid amount in QR code' };
				amount = formatUnits(value, 18);
			}
			const recipient = normalizeAddress(target);
			if (!recipient) return { error: 'Invalid recipient address in QR code' };
			return { address: recipient, amount, chainID: parsedChainID };
		} else {
			const recipient = normalizeAddress(target);
			if (!recipient) return { error: 'Invalid recipient address in QR code' };
			return { address: recipient, chainID: parsedChainID }; // Just an address
		}
	} catch (e) {
		return { error: 'Failed to parse QR code data' };
	}
}

export interface PaymentURLOptions {
	address: string;
	chainID: number;
	currency?: ICurrency | undefined;
	amount?: bigint | undefined;
}

export function generatePaymentURL({ address, chainID, currency, amount }: PaymentURLOptions): string {
	if (!currency?.contract_address) {
		// Native currency payment (ETH) according to ERC-681
		// Format: ethereum:{address}@{chainID}?value={amount}
		return `ethereum:${address}@${chainID}${amount ? `?value=${amount.toString()}` : ''}`;
	} else {
		// ERC-20 token payment according to ERC-681
		// Format: ethereum:{contract_address}@{chainID}/transfer?address={address}&uint256={amount}
		return `ethereum:${currency.contract_address}@${chainID}/transfer?address=${address}${amount ? `&uint256=${amount.toString()}` : ''}`;
	}
}
