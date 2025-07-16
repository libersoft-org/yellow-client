import { get, writable, derived } from 'svelte/store';
import { formatEther, formatUnits, Contract } from 'ethers';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
import { tokens } from '@/org.libersoft.wallet/scripts/network.ts';
import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
export interface IBalance {
	amount: string;
	currency: string;
}
export async function getBalance(): Promise<IBalance | null> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	if (!net || !p || !addr) {
		console.error('Network, provider, or address not set');
		return null;
	}
	console.log('Getting balance for:', addr.address);
	try {
		const balanceWei = await p.getBalance(addr.address);
		const balanceEth = formatEther(balanceWei);
		console.log('Balance fetched:', balanceEth, net.currency.symbol);
		return {
			amount: balanceEth,
			currency: net.currency.symbol,
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
		const formattedBalance = formatUnits(balance, decimals);
		console.log('Token balance fetched:', formattedBalance, token.symbol);
		return {
			amount: formattedBalance,
			currency: token.symbol,
		};
	} catch (error) {
		console.error('Error while getting token balance:', error);
		return null;
	}
}

export async function getExchange(cryptoAmount: string, cryptoSymbol: string, fiatSymbol: string = 'USD'): Promise<IBalance | null> {
	if (!cryptoAmount || cryptoAmount === '?') {
		console.error('Crypto amount not available');
		return null;
	}
	try {
		const rates = await exchangeRates(fiatSymbol);
		if (!rates) {
			console.error('Failed to fetch exchange rates');
			return null;
		}
		const symbol = cryptoSymbol.toUpperCase();
		const rate = rates.rates[symbol];
		if (!rate) {
			console.debug('Exchange rate not found for currency:', symbol);
			return null;
		}
		const amount = parseFloat(cryptoAmount);
		const fiatAmount = (amount / parseFloat(rate)).toFixed(2);
		console.log('Exchange rate calculated:', fiatAmount, fiatSymbol);
		return {
			amount: fiatAmount,
			currency: fiatSymbol,
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
