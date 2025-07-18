import { get, writable, derived } from 'svelte/store';
import { formatEther, formatUnits, Contract } from 'ethers';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
import { tokens } from '@/org.libersoft.wallet/scripts/network.ts';
import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
export interface IBalance {
	amount: bigint;
	currency: string;
	decimals?: number;
}
export async function getBalance(): Promise<IBalance | null> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	if (!net || !p || !addr) {
		console.error('Network, provider, or address not set');
		return null;
	}
	//console.log('Getting balance for:', addr.address);
	try {
		const balanceWei = await p.getBalance(addr.address);
		//console.log('Balance fetched:', balanceWei, net.currency.symbol);
		return {
			amount: balanceWei,
			currency: net.currency.symbol,
			decimals: 18,
		};
	} catch (error) {
		console.error('Error while getting balance:', error);
		return null;
	}
}

export async function getTokenBalance(tokenSymbol: string): Promise<IBalance | null> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	if (!net || !p || !addr) {
		console.error('Network, provider, or address not set');
		return null;
	}
	const token = tokenList.find(t => t.symbol === tokenSymbol);
	if (!token) {
		console.error('Token not found:', tokenSymbol);
		return null;
	}
	console.log('Getting token balance for', token.symbol);
	try {
		const abi = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
		const contract = new Contract(token.contract_address, abi, p);
		const [balance, decimals] = await Promise.all([contract.balanceOf(addr.address), contract.decimals()]);
		console.log('Token balance fetched:', balance, token.symbol);
		return {
			amount: balance,
			currency: token.symbol,
			decimals,
		};
	} catch (error) {
		console.error('Error while getting token balance:', error);
		return null;
	}
}

export async function getExchange(cryptoBalance: IBalance, fiatSymbol: string = 'USD'): Promise<IBalance | null> {
	if (!cryptoBalance.amount) {
		//console.debug('Crypto amount not available');
		return null;
	}
	try {
		const rates = await exchangeRates(fiatSymbol);
		if (!rates) {
			console.error('Failed to fetch exchange rates');
			return null;
		}
		const symbol = cryptoBalance.currency.toUpperCase();
		const rate = rates.rates[symbol];
		if (!rate) {
			console.debug('Exchange rate not found for currency:', symbol);
			return null;
		}
		const rateNumber = Number(rate);
		const rateBigInt = BigInt(Math.round(rateNumber * 1e18));
		const fiatAmount = (cryptoBalance.amount * BigInt(1e18)) / rateBigInt;

		return {
			amount: fiatAmount,
			currency: fiatSymbol,
			decimals: 18,
		};
	} catch (error) {
		console.error('Error while getting exchange rate:', error);
		return null;
	}
}

async function exchangeRates(currency: string = 'USD'): Promise<any> {
	const url = 'https://api.coinbase.com/v2/exchange-rates?currency=' + currency;
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('HTTP error, status: ' + response.status);
		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
		return null;
	}
}

export function formatBalance(balance: IBalance | undefined): string | undefined {
	if (!balance) return undefined;
	return formatUnits(balance.amount, balance.decimals || 18);
}
