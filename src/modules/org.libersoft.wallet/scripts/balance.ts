import { get, writable, derived } from 'svelte/store';
import { formatEther, formatUnits, Contract } from 'ethers';
import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
import { tokens } from '@/org.libersoft.wallet/scripts/network.ts';
import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
export interface IBalance {
	crypto: {
		amount: string;
		currency: string;
	};
	fiat: {
		amount: string;
		currency: string;
	};
}
export interface ITokenBalance {
	symbol: string;
	contract_address: string;
	balance: {
		amount: string;
		currency: string;
	};
	fiat: {
		amount: string;
		currency: string;
	};
}
export const balanceTimestamp = writable<Date | null>(null);
export const balance = writable<IBalance>({
	crypto: {
		amount: '?',
		currency: 'N/A',
	},
	fiat: {
		amount: '?',
		currency: 'USD',
	},
});
export const tokenBalances = writable<ITokenBalance[]>([]);
let resetBalanceTimer: ReturnType<typeof setTimeout> | undefined;
let balanceRefreshInterval: ReturnType<typeof setInterval> | null = null;
const BALANCE_REFRESH_INTERVAL = 30000;
let isRefreshing = false;
let hasInitializedBalance = false;

balance.subscribe((value: IBalance) => {
	console.log('balance:', value);
});

selectedNetwork.subscribe(network => {
	if (network && get(selectedAddress) && get(provider)) {
		if (!hasInitializedBalance) {
			hasInitializedBalance = true;
			refreshAllBalances();
		}
		startBalanceRefreshTimer();
	} else {
		hasInitializedBalance = false;
		stopBalanceRefreshTimer();
	}
});

selectedAddress.subscribe(address => {
	if (address && get(selectedNetwork) && get(provider)) {
		if (!hasInitializedBalance) {
			hasInitializedBalance = true;
			refreshAllBalances();
		}
		startBalanceRefreshTimer();
	} else {
		hasInitializedBalance = false;
		stopBalanceRefreshTimer();
	}
});

provider.subscribe(p => {
	if (p && get(selectedNetwork) && get(selectedAddress)) {
		if (!hasInitializedBalance) {
			hasInitializedBalance = true;
			refreshAllBalances();
		}
		startBalanceRefreshTimer();
	} else {
		hasInitializedBalance = false;
		stopBalanceRefreshTimer();
	}
});

function startBalanceRefreshTimer(): void {
	if (balanceRefreshInterval) clearInterval(balanceRefreshInterval);
	balanceRefreshInterval = setInterval(() => {
		if (get(selectedNetwork) && get(selectedAddress) && get(provider) && !isRefreshing) {
			refreshAllBalances();
		}
	}, BALANCE_REFRESH_INTERVAL);
}

function stopBalanceRefreshTimer(): void {
	if (balanceRefreshInterval) {
		clearInterval(balanceRefreshInterval);
		balanceRefreshInterval = null;
	}
}

async function refreshAllBalances(): Promise<void> {
	if (isRefreshing) return;
	isRefreshing = true;
	try {
		await getBalance();
		await getTokenBalances();
	} finally {
		isRefreshing = false;
	}
}

export async function getBalance(): Promise<void> {
	const p = get(provider);
	console.log('getBalance selectedNetwork: ', get(selectedNetwork), 'provider: ', p);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	if (net && p && addr) {
		try {
			console.log('Getting balance for', addr.address);
			const balanceBigNumber = await p.getBalance(addr.address);
			console.log('balanceBigNumber', balanceBigNumber);
			balanceTimestamp.set(new Date());
			const balanceFormated = formatEther(balanceBigNumber);
			balance.set({
				crypto: {
					amount: balanceFormated,
					currency: net.currency.symbol,
				},
				fiat: {
					amount: '?',
					currency: 'USD',
				},
			});
			const rates = await exchangeRates();
			console.log('got1 rates:', rates);
			const rates2 = rates['rates'];
			console.log('got2 rates:', rates2);
			if (rates2) {
				balance.update(b => {
					const amount_str = b?.crypto?.amount;
					const currency = b?.crypto?.currency;
					const rate = rates2[currency];
					if (amount_str && currency) {
						if (rate) b.fiat.amount = (parseFloat(amount_str) * rate).toString();
						else b.fiat.amount = 'no rate for ' + currency;
					}
					return b;
				});
			} else console.error('No rates');
		} catch (error) {
			console.error('Error while getting balance:', error);
			balance.set({
				crypto: {
					amount: '?',
					currency: net.currency.symbol,
				},
				fiat: {
					amount: '?',
					currency: '?',
				},
			});
			balanceTimestamp.set(new Date());
		}
	} else {
		balance.set({
			crypto: {
				amount: '?',
				currency: 'N/A',
			},
			fiat: {
				amount: '?',
				currency: 'N/A',
			},
		});
		balanceTimestamp.set(null);
	}
}

async function exchangeRates(): Promise<void> {
	const url = 'https://api.coinbase.com/v2/exchange-rates?currency=USD';
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('HTTP error, status: ' + response.status);
		const data = await response.json();
		return data['data'];
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
	}
}

export async function getTokenBalances(): Promise<void> {
	const p = get(provider);
	console.log('getTokenBalances selectedNetwork: ', get(selectedNetwork), 'provider: ', p);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	if (!net || !p || !addr || !tokenList.length) {
		tokenBalances.set([]);
		return;
	}
	const balances: ITokenBalance[] = [];
	for (const token of tokenList) {
		try {
			const abi = ['function balanceOf(address owner) view returns (uint256)'];
			const contract = new Contract(token.contract_address, abi, p);
			const balance = await contract.balanceOf(addr.address);
			const decimals = 18; // TODO: load from contract for tokens with different decimals
			const formattedBalance = formatUnits(balance, decimals);
			balances.push({
				symbol: token.symbol,
				contract_address: token.contract_address,
				balance: {
					amount: formattedBalance,
					currency: token.symbol,
				},
				fiat: {
					amount: '?',
					currency: 'USD',
				},
			});
		} catch (error) {
			console.error(`Error getting balance for token ${token.symbol}:`, error);
			balances.push({
				symbol: token.symbol,
				contract_address: token.contract_address,
				balance: {
					amount: '?',
					currency: token.symbol,
				},
				fiat: {
					amount: '?',
					currency: '?',
				},
			});
		}
	}

	tokenBalances.set(balances);
	try {
		const rates = await exchangeRates();
		const rates2 = rates['rates'];
		if (rates2) {
			tokenBalances.update(balances => {
				return balances.map(tokenBalance => {
					const rate = rates2[tokenBalance.symbol];
					if (rate && tokenBalance.balance.amount !== '?') tokenBalance.fiat.amount = (parseFloat(tokenBalance.balance.amount) * rate).toString();
					else tokenBalance.fiat.amount = 'no rate for ' + tokenBalance.symbol;
					return tokenBalance;
				});
			});
		}
	} catch (error) {
		console.error('Error fetching exchange rates for tokens:', error);
	}
}

export async function getTokenBalance(tokenSymbol: string): Promise<void> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	if (!net || !p || !addr) return;
	const token = tokenList.find(t => t.symbol === tokenSymbol);
	if (!token) return;
	console.log('Getting token balance for', token.symbol);
	try {
		const abi = ['function balanceOf(address owner) view returns (uint256)'];
		const contract = new Contract(token.contract_address, abi, p);
		const balance = await contract.balanceOf(addr.address);
		const decimals = 18; // TODO: load from contract for tokens with different decimals
		const formattedBalance = formatUnits(balance, decimals);
		const newTokenBalance: ITokenBalance = {
			symbol: token.symbol,
			contract_address: token.contract_address,
			balance: {
				amount: formattedBalance,
				currency: token.symbol,
			},
			fiat: {
				amount: '?',
				currency: '?',
			},
		};
		tokenBalances.update(balances => {
			const index = balances.findIndex(b => b.symbol === tokenSymbol);
			if (index >= 0) balances[index] = newTokenBalance;
			else balances.push(newTokenBalance);
			return balances;
		});
		try {
			const rates = await exchangeRates();
			const rates2 = rates['rates'];
			if (rates2) {
				tokenBalances.update(balances => {
					return balances.map(tokenBalance => {
						if (tokenBalance.symbol === tokenSymbol) {
							const rate = rates2[tokenBalance.symbol];
							if (rate && tokenBalance.balance.amount !== '?') tokenBalance.fiat.amount = (parseFloat(tokenBalance.balance.amount) * rate).toString();
							else tokenBalance.fiat.amount = 'no rate for ' + tokenBalance.symbol;
						}
						return tokenBalance;
					});
				});
			}
		} catch (error) {
			console.error('Error fetching exchange rate for token:', error);
		}
	} catch (error) {
		console.error('Error getting balance for token ' + token.symbol + ':', error);
		const errorTokenBalance: ITokenBalance = {
			symbol: token.symbol,
			contract_address: token.contract_address,
			balance: {
				amount: '?',
				currency: token.symbol,
			},
			fiat: {
				amount: '?',
				currency: '?',
			},
		};
		tokenBalances.update(balances => {
			const index = balances.findIndex(b => b.symbol === tokenSymbol);
			if (index >= 0) balances[index] = errorTokenBalance;
			else balances.push(errorTokenBalance);
			return balances;
		});
	}
}

function debouncedResetBalance(): void {
	if (resetBalanceTimer) clearTimeout(resetBalanceTimer);
	resetBalanceTimer = setTimeout(() => resetBalance(), 100);
}

function resetBalance(): void {
	console.log('resetBalance');
	balance.set({
		crypto: {
			amount: '?',
			currency: get(selectedNetwork)?.currency.symbol || '?',
		},
		fiat: { amount: '?', currency: 'USD' },
	});
	balanceTimestamp.set(null);
}

export const selectedMainCurrencySymbol = derived([selectedNetwork], ([$selectedNetwork]) => {
	return $selectedNetwork?.currency.symbol;
});

export let currencies = derived([tokens, selectedMainCurrencySymbol], ([$tokens, $selectedMainCurrencySymbol]) => {
	return [$selectedMainCurrencySymbol, ...$tokens.map(token => token.symbol)].filter((currency): currency is string => currency !== undefined);
});
