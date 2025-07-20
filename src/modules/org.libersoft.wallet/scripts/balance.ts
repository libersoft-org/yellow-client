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
interface MulticallCall {
	target: string;
	callData: string;
}
interface BatchRequestPayload {
	jsonrpc: string;
	id: number;
	method: string;
	params: any[];
}
// Multicall3 contract - uses the same address on most networks
const multicall3Address = '0xcA11bde05977b3631167028862bE2a173976CA11';
const multicallABI = ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'];
// Common ERC-20 ABIs
const erc20InfoABI = ['function name() view returns (string)', 'function symbol() view returns (string)'];
const erc20BalanceABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];

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

export async function getTokenInfo(contractAddress: string): Promise<{ name: string; symbol: string } | null> {
	const batchResult = await getBatchTokensInfo([contractAddress]);
	return batchResult.get(contractAddress) || null;
}

export async function getTokenDecimals(contractAddress: string): Promise<number> {
	const p = get(provider);
	if (!p) {
		console.error('Provider not set');
		return 18; // Fallback
	}
	try {
		const abi = ['function decimals() view returns (uint8)'];
		const contract = new Contract(contractAddress, abi, p);
		const decimals = await contract.decimals();
		return Number(decimals);
	} catch (error) {
		console.error('Error getting token decimals:', error);
		return 18; // Fallback
	}
}

export async function getBatchTokensInfo(contractAddresses: string[]): Promise<Map<string, { name: string; symbol: string }>> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const result = new Map<string, { name: string; symbol: string }>();
	if (!net || !p || contractAddresses.length === 0) {
		console.error('Network, provider not set or no addresses provided');
		return result;
	}
	try {
		// Try Multicall first
		const multicallResult = await tryMulticall(contractAddresses, p, net);
		if (multicallResult && multicallResult.size > 0) {
			// Add successful results to the final result
			multicallResult.forEach((info, address) => {
				result.set(address, info);
			});
			// Check if we got all addresses, if not, try fallback for missing ones
			const missingAddresses = contractAddresses.filter(address => !multicallResult.has(address));
			if (missingAddresses.length === 0) return result; // All addresses successful
			console.log(`Multicall info succeeded for ${multicallResult.size} tokens, trying fallback for ${missingAddresses.length} missing tokens`);
			// Try fallback for missing addresses
			const fallbackResult = await fallbackBatchCall(missingAddresses, p, net);
			if (fallbackResult && fallbackResult.size > 0) {
				fallbackResult.forEach((info, address) => {
					result.set(address, info);
				});
			}
		} else {
			// Multicall completely failed, try fallback for all
			const fallbackResult = await fallbackBatchCall(contractAddresses, p, net);
			if (fallbackResult && fallbackResult.size > 0) {
				fallbackResult.forEach((info, address) => {
					result.set(address, info);
				});
			}
		}
	} catch (error) {
		console.error('Error in batch token info request:', error);
	}
	return result;
}

// Generic Multicall executor
async function executeMulticall<T>(addresses: string[], abi: string[], functionNames: string[], provider: any, network: any, additionalParams: any[] = [], processor: (returnData: string[], addresses: string[], erc20Interface: any, additionalParams: any[]) => Map<string, T>): Promise<Map<string, T> | null> {
	try {
		console.log(`Trying Multicall3 at ${multicall3Address} for chainID ${network.chainID}`);

		const multicallContract = new Contract(multicall3Address, multicallABI, provider);
		const erc20Interface = new Contract(addresses[0], abi, provider).interface;

		// Prepare calls for Multicall
		const calls: MulticallCall[] = [];
		addresses.forEach(address => {
			functionNames.forEach(funcName => {
				calls.push({
					target: address,
					callData: erc20Interface.encodeFunctionData(funcName, additionalParams),
				});
			});
		});

		console.log(`Using Multicall for ${addresses.length} tokens (${calls.length} calls) in ONE blockchain transaction`);

		// Execute Multicall
		const [blockNumber, returnData] = await multicallContract.aggregate(calls);

		// Process results using the provided processor function
		return processor(returnData, addresses, erc20Interface, additionalParams);
	} catch (error) {
		console.warn(`Multicall3 failed for chainID ${network.chainID}:`, error);
		return null;
	}
}

// Process token info results from Multicall
function processTokenInfoResults(returnData: string[], addresses: string[], erc20Interface: any): Map<string, { name: string; symbol: string }> {
	const result = new Map<string, { name: string; symbol: string }>();

	for (let i = 0; i < addresses.length; i++) {
		const nameIndex = i * 2;
		const symbolIndex = i * 2 + 1;
		const address = addresses[i];

		try {
			if (returnData[nameIndex] && returnData[symbolIndex]) {
				const name = erc20Interface.decodeFunctionResult('name', returnData[nameIndex])[0];
				const symbol = erc20Interface.decodeFunctionResult('symbol', returnData[symbolIndex])[0];
				result.set(address, {
					name: String(name),
					symbol: String(symbol),
				});
			} else {
				console.warn(`Failed to get info for token ${address} via Multicall`);
			}
		} catch (error) {
			console.warn(`Error processing token ${address} from Multicall:`, error);
		}
	}

	return result;
}

// Wrapper for token info Multicall
async function tryMulticall(contractAddresses: string[], provider: any, network: any): Promise<Map<string, { name: string; symbol: string }> | null> {
	return executeMulticall(contractAddresses, erc20InfoABI, ['name', 'symbol'], provider, network, [], processTokenInfoResults);
}

// Generic JSON-RPC batch executor
async function executeBatchCall<T>(addresses: string[], abi: string[], functionNames: string[], provider: any, network: any, additionalParams: any[] = [], processor: (batchResults: any[], addresses: string[], contract: Contract) => Map<string, T>): Promise<Map<string, T>> {
	const result = new Map<string, T>();

	try {
		// Create batch request payload for JSON-RPC
		const batchPayload: BatchRequestPayload[] = [];
		let id = 1;

		addresses.forEach(address => {
			const contract = new Contract(address, abi, provider);
			functionNames.forEach(funcName => {
				batchPayload.push({
					jsonrpc: '2.0',
					id: id++,
					method: 'eth_call',
					params: [
						{
							to: address,
							data: contract.interface.encodeFunctionData(funcName, additionalParams),
						},
						'latest',
					],
				});
			});
		});

		console.log(`Fallback: Sending JSON-RPC batch with ${batchPayload.length} calls for ${addresses.length} tokens`);

		// Get provider URL
		const providerUrl = getProviderUrl(network);

		// Send single batch JSON-RPC request
		const response = await fetch(providerUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(batchPayload),
		});

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const batchResults = await response.json();
		if (!Array.isArray(batchResults)) throw new Error('Invalid batch response format');

		// Process results using the provided processor function
		const contract = new Contract(addresses[0], abi, provider); // For decoding
		return processor(batchResults, addresses, contract);
	} catch (error) {
		console.error('Error in batch call:', error);
	}

	return result;
}

// Helper to get provider URL
function getProviderUrl(network: any): string {
	if (network.selectedRpcUrl) return network.selectedRpcUrl;
	if (network.rpcURLs && network.rpcURLs.length > 0) return network.rpcURLs[0];
	throw new Error('No RPC URL available');
}

// Process token info results from JSON-RPC batch
function processTokenInfoBatchResults(batchResults: any[], addresses: string[], contract: Contract): Map<string, { name: string; symbol: string }> {
	const result = new Map<string, { name: string; symbol: string }>();

	for (let i = 0; i < addresses.length; i++) {
		const nameIndex = i * 2;
		const symbolIndex = i * 2 + 1;
		const address = addresses[i];

		try {
			const nameResult = batchResults[nameIndex];
			const symbolResult = batchResults[symbolIndex];

			if (nameResult?.result && symbolResult?.result) {
				const name = contract.interface.decodeFunctionResult('name', nameResult.result)[0];
				const symbol = contract.interface.decodeFunctionResult('symbol', symbolResult.result)[0];
				result.set(address, {
					name: String(name),
					symbol: String(symbol),
				});
			} else {
				console.warn(`Failed to get info for token ${address}`);
			}
		} catch (error) {
			console.warn(`Error processing token ${address}:`, error);
		}
	}

	return result;
}

async function fallbackBatchCall(contractAddresses: string[], provider: any, network: any): Promise<Map<string, { name: string; symbol: string }>> {
	return executeBatchCall(contractAddresses, erc20InfoABI, ['name', 'symbol'], provider, network, [], processTokenInfoBatchResults);
}

// Process token balance results from JSON-RPC batch
function processTokenBalanceBatchResults(batchResults: any[], tokens: any[], contract: Contract): Map<string, IBalance> {
	const result = new Map<string, IBalance>();

	for (let i = 0; i < tokens.length; i++) {
		const balanceIndex = i * 2;
		const decimalsIndex = i * 2 + 1;
		const token = tokens[i];

		try {
			const balanceResult = batchResults[balanceIndex];
			const decimalsResult = batchResults[decimalsIndex];

			if (balanceResult?.result && decimalsResult?.result) {
				const balance = contract.interface.decodeFunctionResult('balanceOf', balanceResult.result)[0];
				const decimals = contract.interface.decodeFunctionResult('decimals', decimalsResult.result)[0];
				result.set(token.symbol, {
					amount: balance,
					currency: token.symbol,
					decimals: Number(decimals),
				});
				console.log(`Successfully got balance for ${token.symbol} via JSON-RPC batch`);
			} else {
				console.warn(`Failed to get balance for token ${token.symbol} via JSON-RPC batch - empty result`);
			}
		} catch (error) {
			console.warn(`Error processing token balance ${token.symbol} from JSON-RPC batch:`, error);
		}
	}

	console.log(`JSON-RPC batch processed ${result.size}/${tokens.length} token balances successfully`);
	return result;
}

// Special JSON-RPC batch executor for balances (handles different function parameters)
async function executeBatchBalanceCall(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance>> {
	const result = new Map<string, IBalance>();

	try {
		// Create batch request payload for JSON-RPC
		const batchPayload: BatchRequestPayload[] = [];
		let id = 1;

		tokensWithAddresses.forEach(token => {
			const contract = new Contract(token.contract_address, erc20BalanceABI, provider);
			// Add balanceOf() call to batch (needs address parameter)
			batchPayload.push({
				jsonrpc: '2.0',
				id: id++,
				method: 'eth_call',
				params: [
					{
						to: token.contract_address,
						data: contract.interface.encodeFunctionData('balanceOf', [addr.address]),
					},
					'latest',
				],
			});
			// Add decimals() call to batch (no parameters)
			batchPayload.push({
				jsonrpc: '2.0',
				id: id++,
				method: 'eth_call',
				params: [
					{
						to: token.contract_address,
						data: contract.interface.encodeFunctionData('decimals'),
					},
					'latest',
				],
			});
		});

		console.log(`Fallback: Sending JSON-RPC batch with ${batchPayload.length} calls for ${tokensWithAddresses.length} token balances`);

		// Get provider URL
		const providerUrl = getProviderUrl(network);

		// Send single batch JSON-RPC request
		const response = await fetch(providerUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(batchPayload),
		});

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const batchResults = await response.json();
		if (!Array.isArray(batchResults)) throw new Error('Invalid batch response format');

		// Process results
		const contract = new Contract(tokensWithAddresses[0].contract_address, erc20BalanceABI, provider);
		return processTokenBalanceBatchResults(batchResults, tokensWithAddresses, contract);
	} catch (error) {
		console.error('Error in batch balance call:', error);
	}

	return result;
}

async function fallbackBatchBalanceCall(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance>> {
	return executeBatchBalanceCall(tokensWithAddresses, provider, network, addr);
}

// Process token balance results from Multicall
function processTokenBalanceResults(returnData: string[], tokens: any[], erc20Interface: any, additionalParams: any[]): Map<string, IBalance> {
	const result = new Map<string, IBalance>();

	for (let i = 0; i < tokens.length; i++) {
		const balanceIndex = i * 2;
		const decimalsIndex = i * 2 + 1;
		const token = tokens[i];

		try {
			if (returnData[balanceIndex] && returnData[decimalsIndex]) {
				const balance = erc20Interface.decodeFunctionResult('balanceOf', returnData[balanceIndex])[0];
				const decimals = erc20Interface.decodeFunctionResult('decimals', returnData[decimalsIndex])[0];
				result.set(token.symbol, {
					amount: balance,
					currency: token.symbol,
					decimals: Number(decimals),
				});
				console.log(`Successfully got balance for ${token.symbol} via Multicall`);
			} else {
				console.warn(`Failed to get balance for token ${token.symbol} via Multicall - empty response`);
			}
		} catch (error) {
			console.warn(`Error processing token balance ${token.symbol} from Multicall:`, error);
		}
	}

	console.log(`Multicall processed ${result.size}/${tokens.length} token balances successfully`);
	return result;
}

// Special Multicall executor for balances (handles different function parameters)
async function executeMulticallBalances(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance> | null> {
	try {
		console.log(`Trying Multicall3 at ${multicall3Address} for chainID ${network.chainID}`);

		const multicallContract = new Contract(multicall3Address, multicallABI, provider);
		const erc20Interface = new Contract(tokensWithAddresses[0].contract_address, erc20BalanceABI, provider).interface;

		// Prepare calls for Multicall
		const calls: MulticallCall[] = [];
		tokensWithAddresses.forEach(token => {
			calls.push({
				target: token.contract_address,
				callData: erc20Interface.encodeFunctionData('balanceOf', [addr.address]),
			});
			calls.push({
				target: token.contract_address,
				callData: erc20Interface.encodeFunctionData('decimals'),
			});
		});

		console.log(`Using Multicall for ${tokensWithAddresses.length} token balances (${calls.length} calls) in ONE blockchain transaction`);

		// Execute Multicall
		const [blockNumber, returnData] = await multicallContract.aggregate(calls);

		// Process results
		return processTokenBalanceResults(returnData, tokensWithAddresses, erc20Interface, []);
	} catch (error) {
		console.warn(`Multicall3 failed for chainID ${network.chainID}:`, error);
		return null;
	}
}

// Wrapper for token balance Multicall
async function tryMulticallBalances(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance> | null> {
	return executeMulticallBalances(tokensWithAddresses, provider, network, addr);
}

export async function getBatchTokenBalances(tokenSymbols: string[]): Promise<Map<string, IBalance>> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	const result = new Map<string, IBalance>();

	if (!net || !p || !addr || tokenSymbols.length === 0) {
		console.error('Network, provider, address not set or no tokens provided');
		return result;
	}

	// Filter tokens that have contract addresses
	const tokensWithAddresses = tokenSymbols.map(symbol => tokenList.find(t => t.symbol === symbol)).filter((token): token is NonNullable<typeof token> => token !== undefined && !!token.contract_address);

	if (tokensWithAddresses.length === 0) return result;

	console.log(
		`Starting batch balance loading for ${tokensWithAddresses.length} tokens:`,
		tokensWithAddresses.map(t => t.symbol)
	);

	let remainingTokens = [...tokensWithAddresses]; // Create a copy

	try {
		// Try Multicall3 first
		if (remainingTokens.length > 0) {
			const multicallResult = await tryMulticallBalances(remainingTokens, p, net, addr);
			if (multicallResult && multicallResult.size > 0) {
				// Add successful results to the final result
				multicallResult.forEach((balance, symbol) => {
					result.set(symbol, balance);
				});

				// Filter out successful tokens from remaining
				remainingTokens = remainingTokens.filter(token => !multicallResult.has(token.symbol));
				console.log(`Multicall succeeded for ${multicallResult.size} tokens, ${remainingTokens.length} tokens remaining`);
			} else {
				console.log('Multicall returned no results, all tokens will try fallback');
			}
		}

		// Fallback 2: JSON-RPC batch for remaining/failed tokens
		if (remainingTokens.length > 0) {
			try {
				const batchResult = await fallbackBatchBalanceCall(remainingTokens, p, net, addr);
				if (batchResult.size > 0) {
					batchResult.forEach((balance, symbol) => {
						result.set(symbol, balance);
					});

					// Filter out successful tokens from remaining
					remainingTokens = remainingTokens.filter(token => !batchResult.has(token.symbol));
					console.log(`JSON-RPC batch succeeded for ${batchResult.size} tokens, ${remainingTokens.length} tokens still remaining`);
				}
			} catch (error) {
				console.warn('JSON-RPC batch for balances failed, falling back to individual calls:', error);
			}
		}

		// Fallback 3: individual calls in parallel for remaining tokens
		if (remainingTokens.length > 0) {
			console.log(`Fallback: Loading ${remainingTokens.length} token balances individually`);
			const balancePromises = remainingTokens.map(async token => {
				try {
					// Use direct contract call to avoid infinite recursion
					const tokenBalance = await getDirectTokenBalance(token, p, addr);
					return { symbol: token.symbol, balance: tokenBalance };
				} catch (error) {
					console.warn(`Error getting balance for ${token.symbol}:`, error);
					return { symbol: token.symbol, balance: null };
				}
			});
			const balanceResults = await Promise.all(balancePromises);
			balanceResults.forEach(({ symbol, balance }) => {
				if (balance) {
					result.set(symbol, balance);
					console.log(`Individual call succeeded for ${symbol}`);
				} else {
					console.warn(`Individual call failed for ${symbol}`);
				}
			});
		}
	} catch (error) {
		console.error('Error in batch token balance loading:', error);
	}

	console.log(`Final result: successfully loaded ${result.size}/${tokensWithAddresses.length} token balances`);
	console.log('Successful tokens:', Array.from(result.keys()));
	const failedTokens = tokensWithAddresses.filter(token => !result.has(token.symbol));
	if (failedTokens.length > 0) {
		console.warn(
			'Failed tokens:',
			failedTokens.map(t => t.symbol)
		);
	}

	return result;
}

// Direct token balance call (to avoid recursion in fallback)
async function getDirectTokenBalance(token: any, provider: any, addr: any): Promise<IBalance | null> {
	try {
		if (!token.contract_address) {
			console.error('Token contract address is missing for', token.symbol);
			return null;
		}
		const abi = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
		const contract = new Contract(token.contract_address, abi, provider);
		const [balance, decimals] = await Promise.all([contract.balanceOf(addr.address), contract.decimals()]);
		return {
			amount: balance,
			currency: token.symbol,
			decimals: Number(decimals),
		};
	} catch (error) {
		console.error('Error while getting direct token balance:', error);
		return null;
	}
}

export async function getTokenBalance(tokenSymbol: string): Promise<IBalance | null> {
	const batchResult = await getBatchTokenBalances([tokenSymbol]);
	return batchResult.get(tokenSymbol) || null;
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

export function formatBalance(balance: IBalance | undefined, locale?: string, maximumFractionDigits?: number): string | undefined {
	if (!balance) return undefined;
	// Convert BigInt to string using formatUnits - preserves all decimal places
	let numericValue = formatUnits(balance.amount, balance.decimals || 18);
	// If maximumFractionDigits is specified, truncate decimal places
	if (maximumFractionDigits !== undefined) {
		const number = parseFloat(numericValue);
		numericValue = number.toFixed(maximumFractionDigits);
	}
	// Split into integer and decimal parts
	const [integerPart, decimalPart] = numericValue.split('.');
	// Use Intl.NumberFormat only for integer part (for thousands separators)
	const formatter = new Intl.NumberFormat(locale || navigator.language, { useGrouping: true });
	const formattedInteger = formatter.format(parseInt(integerPart));
	// Get local decimal separator
	const decimalSeparator = new Intl.NumberFormat(locale || navigator.language).formatToParts(1.1).find(part => part.type === 'decimal')?.value || '.';
	// Join integer and decimal parts with local separator
	if (decimalPart && decimalPart !== '0'.repeat(decimalPart.length)) return formattedInteger + decimalSeparator + decimalPart;
	else return formattedInteger;
}
