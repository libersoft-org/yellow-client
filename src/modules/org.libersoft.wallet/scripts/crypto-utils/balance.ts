import { get } from 'svelte/store';
import { formatUnits, Contract } from 'ethers';
import { selectedNetwork, nfts as nftStore, tokens } from './network.ts';
import { selectedAddress } from './wallet.ts';
import { provider } from './provider.ts';

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
			currency: net.currency.symbol || 'Unknown',
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

export async function getBatchTokenBalances(): Promise<Map<string, IBalance>> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const tokenList = get(tokens);
	const result = new Map<string, IBalance>();

	if (!net || !p || !addr) {
		console.error('Network, provider, or address not set');
		return result;
	}

	// Filter tokens that have contract addresses
	const tokensWithAddresses = tokenList.filter(token => token.contract_address);

	if (tokensWithAddresses.length === 0) return result;

	console.log(
		`Starting batch balance loading for ${tokensWithAddresses.length} tokens:`,
		tokensWithAddresses.map(t => t.contract_address)
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
				remainingTokens = remainingTokens.filter(token => !multicallResult.has(token.contract_address));
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
					remainingTokens = remainingTokens.filter(token => !batchResult.has(token.contract_address));
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
					return { symbol: token.contract_address, balance: tokenBalance };
				} catch (error) {
					console.warn(`Error getting balance for ${token.contract_address}:`, error);
					return { symbol: token.contract_address, balance: null };
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
	const failedTokens = tokensWithAddresses.filter(token => !result.has(token.contract_address));
	if (failedTokens.length > 0) {
		console.warn(
			'Failed tokens:',
			failedTokens.map(t => t.contract_address)
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

export async function getTokenBalanceByAddress(contractAddress: string): Promise<IBalance | null> {
	const p = get(provider);
	const addr = get(selectedAddress);
	if (!p || !addr) {
		console.error('Provider or address not set');
		return null;
	}
	try {
		const abi = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)', 'function symbol() view returns (string)'];
		const contract = new Contract(contractAddress, abi, p);
		const [balance, decimals, symbol] = await Promise.all([contract.balanceOf(addr.address), contract.decimals(), contract.symbol()]);
		return {
			amount: balance,
			currency: symbol,
			decimals: Number(decimals),
		};
	} catch (error) {
		console.error('Error while getting token balance by address:', error);
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

export function formatBalance(balance: IBalance, roundToDecimals: number = -1, showCurrency: boolean = true): string | undefined {
	if (balance.amount === undefined || balance.amount === null) return undefined;
	let formatedAmount = formatUnits(balance.amount, balance.decimals !== undefined ? balance.decimals : 18);
	const decimals = balance.decimals !== undefined && balance.decimals !== null ? balance.decimals : 18;
	roundToDecimals = roundToDecimals > -1 ? roundToDecimals : decimals;
	// TODO: Intl.NumberFormat supports maximumFractionDigits only up to 20, so we need to handle larger fraction numbers differently
	return Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: roundToDecimals }).format(Number(formatedAmount)) + (showCurrency ? ' ' + balance.currency : '');
}

// NEW: Batch token balances by contract addresses (not symbols)
export async function getBatchTokenBalancesByAddresses(contractAddresses: string[]): Promise<Map<string, IBalance>> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const result = new Map<string, IBalance>();

	if (!net || !p || !addr || contractAddresses.length === 0) {
		console.error('Network, provider, address not set or no addresses provided');
		return result;
	}

	// Create token objects with addresses for compatibility with existing functions
	const tokensWithAddresses = contractAddresses.map(address => ({ contract_address: address }));

	console.log(`Starting batch balance loading for ${tokensWithAddresses.length} tokens by addresses`);

	let remainingTokens = [...tokensWithAddresses];

	try {
		// Try Multicall3 first
		if (remainingTokens.length > 0) {
			const multicallResult = await tryMulticallBalancesByAddress(remainingTokens, p, net, addr);
			if (multicallResult && multicallResult.size > 0) {
				// Add successful results to the final result
				multicallResult.forEach((balance, contractAddress) => {
					result.set(contractAddress, balance);
				});

				// Filter out successful tokens from remaining
				remainingTokens = remainingTokens.filter(token => !multicallResult.has(token.contract_address));
				console.log(`Multicall succeeded for ${multicallResult.size} tokens, ${remainingTokens.length} tokens remaining`);
			} else {
				console.log('Multicall returned no results, all tokens will try fallback');
			}
		}

		// Fallback: JSON-RPC batch for remaining/failed tokens
		if (remainingTokens.length > 0) {
			try {
				const batchResult = await fallbackBatchBalanceCallByAddress(remainingTokens, p, net, addr);
				if (batchResult.size > 0) {
					batchResult.forEach((balance, contractAddress) => {
						result.set(contractAddress, balance);
					});

					remainingTokens = remainingTokens.filter(token => !batchResult.has(token.contract_address));
					console.log(`JSON-RPC batch succeeded for ${batchResult.size} tokens, ${remainingTokens.length} tokens still remaining`);
				}
			} catch (error) {
				console.warn('JSON-RPC batch for balances failed, falling back to individual calls:', error);
			}
		}

		// Fallback: individual calls in parallel for remaining tokens
		if (remainingTokens.length > 0) {
			console.log(`Fallback: Loading ${remainingTokens.length} token balances individually`);
			const balancePromises = remainingTokens.map(async token => {
				try {
					const tokenBalance = await getTokenBalanceByAddress(token.contract_address);
					return { contractAddress: token.contract_address, balance: tokenBalance };
				} catch (error) {
					console.warn(`Error getting balance for ${token.contract_address}:`, error);
					return null;
				}
			});

			const balanceResults = await Promise.all(balancePromises);
			balanceResults.forEach(resultItem => {
				if (resultItem?.balance) {
					result.set(resultItem.contractAddress, resultItem.balance);
				}
			});
		}
	} catch (error) {
		console.error('Error in batch token balance loading by addresses:', error);
	}

	console.log(`Final result: ${result.size}/${contractAddresses.length} token balances loaded successfully`);
	return result;
}

// Helper functions for address-based batch loading
async function tryMulticallBalancesByAddress(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance> | null> {
	return executeMulticallBalancesByAddress(tokensWithAddresses, provider, network, addr);
}

async function executeMulticallBalancesByAddress(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance> | null> {
	try {
		console.log(`Trying Multicall3 for ${tokensWithAddresses.length} token balances by address`);
		const multicallContract = new Contract(multicall3Address, multicallABI, provider);
		const erc20Interface = new Contract(tokensWithAddresses[0].contract_address, erc20BalanceABI, provider).interface;
		// Prepare calls for Multicall
		const calls: MulticallCall[] = [];
		tokensWithAddresses.forEach(token => {
			// Add balanceOf() call
			calls.push({
				target: token.contract_address,
				callData: erc20Interface.encodeFunctionData('balanceOf', [addr.address]),
			});
			// Add decimals() call
			calls.push({
				target: token.contract_address,
				callData: erc20Interface.encodeFunctionData('decimals'),
			});
		});
		console.log(`Using Multicall for ${tokensWithAddresses.length} token balances (${calls.length} calls) in ONE blockchain transaction`);
		// Execute Multicall
		const [blockNumber, returnData] = await multicallContract.aggregate(calls);
		// Process results
		const result = new Map<string, IBalance>();
		for (let i = 0; i < tokensWithAddresses.length; i++) {
			const balanceIndex = i * 2;
			const decimalsIndex = i * 2 + 1;
			const token = tokensWithAddresses[i];
			try {
				if (returnData[balanceIndex] && returnData[decimalsIndex]) {
					const balance = erc20Interface.decodeFunctionResult('balanceOf', returnData[balanceIndex])[0];
					const decimals = erc20Interface.decodeFunctionResult('decimals', returnData[decimalsIndex])[0];
					result.set(token.contract_address, {
						amount: balance,
						currency: 'TOKEN', // We don't have symbol yet
						decimals: Number(decimals),
					});
				} else {
					console.warn(`Failed to get balance for token ${token.contract_address} via Multicall`);
				}
			} catch (error) {
				console.warn(`Error processing token ${token.contract_address} from Multicall:`, error);
			}
		}
		console.log(`Multicall processed ${result.size}/${tokensWithAddresses.length} token balances successfully`);
		return result;
	} catch (error) {
		console.warn(`Multicall3 failed for token balances:`, error);
		return null;
	}
}

async function fallbackBatchBalanceCallByAddress(tokensWithAddresses: any[], provider: any, network: any, addr: any): Promise<Map<string, IBalance>> {
	const result = new Map<string, IBalance>();

	try {
		// Create batch request payload for JSON-RPC
		const batchPayload: BatchRequestPayload[] = [];
		let id = 1;

		tokensWithAddresses.forEach(token => {
			const contract = new Contract(token.contract_address, erc20BalanceABI, provider);
			// Add balanceOf() call to batch
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
			// Add decimals() call to batch
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
		for (let i = 0; i < tokensWithAddresses.length; i++) {
			const balanceIndex = i * 2;
			const decimalsIndex = i * 2 + 1;
			const token = tokensWithAddresses[i];
			try {
				const balanceResult = batchResults[balanceIndex];
				const decimalsResult = batchResults[decimalsIndex];
				if (balanceResult?.result && decimalsResult?.result) {
					const balance = contract.interface.decodeFunctionResult('balanceOf', balanceResult.result)[0];
					const decimals = contract.interface.decodeFunctionResult('decimals', decimalsResult.result)[0];
					result.set(token.contract_address, {
						amount: balance,
						currency: 'TOKEN',
						decimals: Number(decimals),
					});
				} else {
					console.warn(`Failed to get balance for token ${token.contract_address} via JSON-RPC batch`);
				}
			} catch (error) {
				console.warn(`Error processing token ${token.contract_address} from JSON-RPC batch:`, error);
			}
		}
		console.log(`JSON-RPC batch processed ${result.size}/${tokensWithAddresses.length} token balances successfully`);
	} catch (error) {
		console.error('Error in batch balance call by address:', error);
	}
	return result;
}

// ERC-721 and ERC-1155 ABIs for NFT operations
const erc721ABI = ['function balanceOf(address owner) view returns (uint256)', 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)', 'function tokenURI(uint256 tokenId) view returns (string)', 'function ownerOf(uint256 tokenId) view returns (address)', 'function name() view returns (string)', 'function symbol() view returns (string)', 'function totalSupply() view returns (uint256)', 'function tokenByIndex(uint256 index) view returns (uint256)'];
// Alternative minimal ABI for contracts that might not support full enumeration
const erc721MinimalABI = ['function balanceOf(address owner) view returns (uint256)', 'function ownerOf(uint256 tokenId) view returns (address)', 'function tokenURI(uint256 tokenId) view returns (string)', 'function name() view returns (string)', 'function symbol() view returns (string)'];
const erc1155ABI = ['function balanceOf(address account, uint256 id) view returns (uint256)', 'function uri(uint256 id) view returns (string)'];

export interface INFTItem {
	contract_address: string;
	token_id: string;
	name?: string;
	description?: string;
	image?: string;
	animation_url?: string;
	external_url?: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
	}>;
	// Collection information
	collection_name?: string;
	collection_symbol?: string;
	// Balance information for ERC-1155
	balance?: number;
}

async function fetchNFTMetadata(tokenURI: string): Promise<Partial<INFTItem>> {
	try {
		console.log(`    🔗 Original token URI:`, tokenURI);

		// Handle IPFS URLs - remove multiple ipfs:// or ipfs/ prefixes
		if (tokenURI.startsWith('ipfs://')) {
			tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		// Handle case where URI already contains ipfs/ but we added another one
		tokenURI = tokenURI.replace('ipfs/ipfs/', 'ipfs/');

		console.log(`    🔗 Processed token URI:`, tokenURI);

		const response = await fetch(tokenURI);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const metadata = await response.json();
		console.log(`    📋 Fetched metadata:`, metadata);

		// Handle IPFS URLs in image field with the same logic
		if (metadata.image && metadata.image.startsWith('ipfs://')) {
			metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
			// Fix double ipfs/ in image URL too
			metadata.image = metadata.image.replace('ipfs/ipfs/', 'ipfs/');
		}

		console.log(`    📋 Processed image URL:`, metadata.image);

		return {
			name: metadata.name,
			description: metadata.description,
			image: metadata.image,
			animation_url: metadata.animation_url,
			external_url: metadata.external_url,
			attributes: metadata.attributes,
		};
	} catch (error) {
		console.warn('Failed to fetch NFT metadata from:', tokenURI, error);
		return {};
	}
}

async function processNFTToken(contract: Contract, contractAddress: string, tokenId: string, balance?: number): Promise<INFTItem | null> {
	try {
		console.log(`    🎨 Processing NFT ${contractAddress} #${tokenId}`);

		// Get collection info (name and symbol)
		let collectionName = '';
		let collectionSymbol = '';
		try {
			collectionName = await contract.name();
			console.log(`    📋 Collection name: ${collectionName}`);
		} catch (error) {
			console.warn(`    ⚠️ Failed to get collection name:`, error instanceof Error ? error.message : error);
		}

		try {
			collectionSymbol = await contract.symbol();
			console.log(`    📋 Collection symbol: ${collectionSymbol}`);
		} catch (error) {
			console.warn(`    ⚠️ Failed to get collection symbol:`, error instanceof Error ? error.message : error);
		}

		// Get token URI for metadata
		let tokenURI = '';
		try {
			tokenURI = await contract.tokenURI(tokenId);
			console.log(`    🔗 Token URI for ${contractAddress} #${tokenId}:`, tokenURI);
		} catch (error) {
			console.warn(`    ❌ Failed to get tokenURI for ${contractAddress} #${tokenId}:`, error instanceof Error ? error.message : error);
		}

		// Fetch metadata
		const metadata = tokenURI ? await fetchNFTMetadata(tokenURI) : {};

		const nftItem: INFTItem = {
			contract_address: contractAddress,
			token_id: tokenId,
			name: metadata.name || `NFT #${tokenId}`,
			description: metadata.description,
			image: metadata.image,
			animation_url: metadata.animation_url,
			external_url: metadata.external_url,
			attributes: metadata.attributes,
			collection_name: collectionName,
			collection_symbol: collectionSymbol,
			balance: balance,
		};

		console.log(`    ✅ Added NFT: ${metadata.name || `NFT #${tokenId}`} from collection: ${collectionName}`);
		return nftItem;
	} catch (error) {
		console.warn(`    ❌ Error processing NFT ${contractAddress} #${tokenId}:`, error instanceof Error ? error.message : error);
		return null;
	}
}

async function getNFTsFromPolygonAPI(address: string): Promise<INFTItem[]> {
	try {
		// Try to use public API endpoints that don't require API keys
		// This will only work if there are publicly available endpoints

		console.log('Attempting to fetch NFTs from public APIs...');

		// For now, return empty array since most APIs require keys
		// In a real app, you'd configure API keys for Alchemy, Moralis, etc.
		return [];
	} catch (error) {
		console.error('Error fetching NFTs from Polygon API:', error);
		throw error;
	}
}

// Load NFTs from configured contracts only
export async function getNFTsFromConfiguredContracts(): Promise<INFTItem[]> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);
	const configuredNFTs = get(nftStore) || [];

	if (!net || !p || !addr) {
		console.error('Network, provider, or address not set');
		return [];
	}

	if (configuredNFTs.length === 0) {
		console.log('No NFT contracts configured');
		return [];
	}

	console.log(`Loading NFTs from ${configuredNFTs.length} configured contracts for address:`, addr.address);

	const allNFTs: INFTItem[] = [];

	for (const configuredNFT of configuredNFTs) {
		if (!configuredNFT.contract_address) continue;

		try {
			console.log(`Checking NFT contract: ${configuredNFT.contract_address}`);

			// Try ERC721 first
			try {
				const contract = new Contract(configuredNFT.contract_address, erc721ABI, p);
				const balance = Number(await contract.balanceOf(addr.address));
				console.log(`ERC721 balance for contract ${configuredNFT.contract_address}: ${balance}`);

				if (balance > 0) {
					// Try to get token IDs using tokenOfOwnerByIndex if available
					try {
						for (let i = 0; i < Math.min(balance, 10); i++) {
							// Limit to first 10 NFTs
							const tokenId = await contract.tokenOfOwnerByIndex(addr.address, i);
							const nftItem = await processNFTToken(contract, configuredNFT.contract_address, tokenId.toString(), 1);
							if (nftItem) {
								allNFTs.push(nftItem);
							}
						}
					} catch (error) {
						console.warn(`Contract ${configuredNFT.contract_address} doesn't support tokenOfOwnerByIndex`);
						// Create a placeholder NFT item showing we have NFTs but can't enumerate them
						const basicNFT: INFTItem = {
							contract_address: configuredNFT.contract_address,
							token_id: '0',
							name: `${balance} NFTs owned`,
							description: 'Contract does not support token enumeration',
							collection_name: 'Unknown Collection',
							collection_symbol: 'UNK',
							balance: balance,
						};
						allNFTs.push(basicNFT);
					}
				}
			} catch (erc721Error) {
				console.log(`Contract ${configuredNFT.contract_address} is not ERC721, trying ERC1155...`);

				// Try ERC1155 - but we need specific token IDs to check
				try {
					const erc1155Contract = new Contract(configuredNFT.contract_address, erc1155ABI, p);

					// If user configured specific token_id, check that
					if (configuredNFT.token_id) {
						const balance = Number(await erc1155Contract.balanceOf(addr.address, configuredNFT.token_id));
						console.log(`ERC1155 balance for token ${configuredNFT.token_id}: ${balance}`);

						if (balance > 0) {
							// Get basic contract info
							let collectionName = 'Unknown Collection';
							let collectionSymbol = 'UNK';
							try {
								const contract = new Contract(configuredNFT.contract_address, erc721ABI, p);
								collectionName = await contract.name();
								collectionSymbol = await contract.symbol();
							} catch (nameError) {
								console.warn(`Could not get collection info:`, nameError);
							}

							// Get token URI if available
							let tokenURI = '';
							let metadata: any = {};
							try {
								tokenURI = await erc1155Contract.uri(configuredNFT.token_id);
								if (tokenURI) {
									metadata = await fetchNFTMetadata(tokenURI);
								}
							} catch (uriError) {
								console.warn(`Could not get token URI:`, uriError);
							}

							const nftItem: INFTItem = {
								contract_address: configuredNFT.contract_address,
								token_id: configuredNFT.token_id,
								name: metadata.name || `Token #${configuredNFT.token_id}`,
								description: metadata.description,
								image: metadata.image,
								animation_url: metadata.animation_url,
								external_url: metadata.external_url,
								attributes: metadata.attributes,
								collection_name: collectionName,
								collection_symbol: collectionSymbol,
								balance: balance,
							};
							allNFTs.push(nftItem);
						}
					} else {
						console.warn(`ERC1155 contract ${configuredNFT.contract_address} requires specific token_id to check balance`);
					}
				} catch (erc1155Error) {
					console.warn(`Contract ${configuredNFT.contract_address} is neither ERC721 nor ERC1155 compatible`);
				}
			}
		} catch (error) {
			console.error(`Error processing NFT contract ${configuredNFT.contract_address}:`, error);
		}
	}

	console.log(`Found ${allNFTs.length} NFTs from configured contracts`);
	return allNFTs;
}

export async function getNFTsForAddress(): Promise<INFTItem[]> {
	const p = get(provider);
	const net = get(selectedNetwork);
	const addr = get(selectedAddress);

	if (!net || !p || !addr) {
		console.error('Network, provider, or address not set');
		return [];
	}

	console.log('Loading NFTs for address:', addr.address, 'on chain:', net.chainID);

	// Try to use external API for better NFT discovery
	if (net.chainID === 137) {
		// Polygon
		try {
			const apiNFTs = await getNFTsFromPolygonAPI(addr.address);
			if (apiNFTs.length > 0) {
				console.log(`Found ${apiNFTs.length} NFTs via Polygon API`);
				return apiNFTs;
			}
		} catch (error) {
			console.warn('Failed to load NFTs from Polygon API, falling back to contract scanning:', error);
		}
	}
	// Get configured NFT contracts from network settings
	const configuredNFTs = get(nftStore) || [];
	console.log('🔧 Using configured NFT contracts:', configuredNFTs.length);
	// If no NFT contracts are configured, return empty array
	if (configuredNFTs.length === 0) {
		console.log('⚠️ No NFT contracts configured. Please add NFT contract addresses in wallet settings.');
		return [];
	}
	const nfts: INFTItem[] = [];
	console.log('🔍 Starting NFT scan for:', addr.address);
	console.log('📋 Configured contracts to check:', configuredNFTs.length);
	console.log('🌐 Chain:', net.chainID, '(' + net.name + ')');
	try {
		// Check each configured contract
		for (const configuredNFT of configuredNFTs) {
			const contractAddress = configuredNFT.contract_address;
			if (!contractAddress) continue;
			console.log(`🔎 Checking contract: ${contractAddress}`);
			try {
				const contract = new Contract(contractAddress, erc721ABI, p);
				// Special handling for ERC-1155 contracts if configured token_id is provided
				if (configuredNFT.token_id) {
					console.log(`🎯 SPECIAL HANDLING for NFT contract (ERC-1155) with configured token_id!`);

					// First, let's try to call some basic functions to see if contract exists
					try {
						const name = await contract.name();
						console.log(`    📋 Contract name: ${name}`);
					} catch (error) {
						console.warn(`    ❌ Could not get contract name:`, error instanceof Error ? error.message : error);
					}

					try {
						const symbol = await contract.symbol();
						console.log(`    📋 Contract symbol: ${symbol}`);
					} catch (error) {
						console.warn(`    ❌ Could not get contract symbol:`, error instanceof Error ? error.message : error);
					}

					// Try ERC-1155 approach first with configured token_id
					console.log(`🎯 Trying ERC-1155 approach for this contract`);
					console.log(`    🎯 Using configured token ID: ${configuredNFT.token_id}`);

					try {
						// Create ERC-1155 contract instance
						const erc1155Contract = new Contract(contractAddress, erc1155ABI, p);

						// Check balance for specific token ID (ERC-1155 style)
						const balance1155 = await erc1155Contract.balanceOf(addr.address, configuredNFT.token_id);
						const balance1155Num = Number(balance1155);
						console.log(`    📊 ERC-1155 balance for token ${configuredNFT.token_id}: ${balance1155Num}`);

						if (balance1155Num > 0) {
							console.log(`    ✅ SUCCESS! You own ${balance1155Num} of ERC-1155 token ${configuredNFT.token_id}!`);

							// Get collection info from ERC-1155 contract
							let collectionName = '';
							let collectionSymbol = '';
							try {
								// Try to get name and symbol from main contract first
								collectionName = await contract.name();
								collectionSymbol = await contract.symbol();
							} catch (nameError) {
								console.warn(`    ⚠️ Could not get collection info from main contract:`, nameError instanceof Error ? nameError.message : nameError);
							}

							// Get metadata using ERC-1155 uri() function
							try {
								const tokenURI = await erc1155Contract.uri(configuredNFT.token_id);
								console.log(`    🔗 ERC-1155 Token URI:`, tokenURI);

								// Fetch metadata
								const metadata = tokenURI ? await fetchNFTMetadata(tokenURI) : {};

								const nftItem: INFTItem = {
									contract_address: contractAddress,
									token_id: configuredNFT.token_id,
									name: metadata.name || `${configuredNFT.name || 'NFT'} #${configuredNFT.token_id}`,
									description: metadata.description,
									image: metadata.image,
									animation_url: metadata.animation_url,
									external_url: metadata.external_url,
									attributes: metadata.attributes,
									collection_name: collectionName,
									collection_symbol: collectionSymbol,
									balance: balance1155Num,
								};

								nfts.push(nftItem);
								console.log(`    🎉 Successfully added your ERC-1155 NFT with balance ${balance1155Num}!`);
							} catch (uriError) {
								console.warn(`    ⚠️ Could not get URI for ERC-1155 token:`, uriError instanceof Error ? uriError.message : uriError);

								// Add basic NFT item without metadata
								const nftItem: INFTItem = {
									contract_address: contractAddress,
									token_id: configuredNFT.token_id,
									name: `${configuredNFT.name || 'NFT'} #${configuredNFT.token_id}`,
									description: 'ERC-1155 NFT',
									collection_name: collectionName,
									collection_symbol: collectionSymbol,
									balance: balance1155Num,
								};
								nfts.push(nftItem);
								console.log(`    🎉 Added basic ERC-1155 NFT without metadata`);
							}
						} else {
							console.log(`    ⚪ No balance for ERC-1155 token ${configuredNFT.token_id}`);
						}
					} catch (erc1155Error) {
						console.warn(`    ⚠️ ERC-1155 approach failed, trying ERC-721:`, erc1155Error instanceof Error ? erc1155Error.message : erc1155Error);
						// Fallback to ERC-721 approach
						try {
							const owner = await contract.ownerOf(configuredNFT.token_id);
							console.log(`    🔍 ERC-721 Token ${configuredNFT.token_id} owner: ${owner}`);
							console.log(`    🔍 Your address: ${addr.address}`);
							console.log(`    🔍 Addresses match: ${owner.toLowerCase() === addr.address.toLowerCase()}`);
							if (owner.toLowerCase() === addr.address.toLowerCase()) {
								console.log(`    ✅ SUCCESS! You own ERC-721 token ${configuredNFT.token_id}!`);
								const nftItem = await processNFTToken(contract, contractAddress, configuredNFT.token_id);
								if (nftItem) {
									nfts.push(nftItem);
									console.log(`    🎉 Successfully added your ERC-721 NFT!`);
								}
							} else console.log(`    ❌ Token ${configuredNFT.token_id} is owned by someone else: ${owner}`);
						} catch (ownerError) {
							console.warn(`    ❌ Both ERC-1155 and ERC-721 approaches failed:`, ownerError instanceof Error ? ownerError.message : ownerError);
						}
					}
					// Skip the normal balanceOf() flow for this contract
					continue;
				}
				// Check if user owns any NFTs from this contract (normal flow for other contracts)
				let balance: any;
				let balanceNum: number;
				try {
					balance = await contract.balanceOf(addr.address);
					balanceNum = Number(balance);
				} catch (balanceError) {
					console.warn(`  ⚠️ balanceOf() failed for ${contractAddress}:`, balanceError instanceof Error ? balanceError.message : balanceError);
					continue; // Skip this contract if balanceOf fails
				}
				console.log(`  📊 Balance for ${contractAddress}: ${balanceNum}`);
				if (balanceNum > 0) {
					console.log(`  ✅ Found ${balanceNum} NFTs in contract ${contractAddress}!`);
					// Get token IDs owned by the user
					let foundTokens = 0;
					// Method 1: Try tokenOfOwnerByIndex (enumerable contracts)
					try {
						for (let i = 0; i < Math.min(balanceNum, 10); i++) {
							try {
								const tokenId = await contract.tokenOfOwnerByIndex(addr.address, i);
								const tokenIdStr = tokenId.toString();
								console.log(`    🎨 Processing NFT ${contractAddress} #${tokenIdStr} (method 1)`);
								const nftItem = await processNFTToken(contract, contractAddress, tokenIdStr);
								if (nftItem) {
									nfts.push(nftItem);
									foundTokens++;
								}
							} catch (error) {
								console.warn(`    ❌ Error getting token ${i} from ${contractAddress}:`, error instanceof Error ? error.message : error);
							}
						}
					} catch (enumError) {
						console.warn(`  ⚠️ Contract ${contractAddress} doesn't support tokenOfOwnerByIndex, trying alternative method...`);
						// Method 2: Try some common token ID patterns
						console.log(`    🔍 Trying common token ID patterns...`);
						const commonPatterns = [1, 2, 3, 4, 5, 10, 100, 1000];
						for (const tokenId of commonPatterns) {
							try {
								const owner = await contract.ownerOf(tokenId);
								if (owner.toLowerCase() === addr.address.toLowerCase()) {
									console.log(`    ✅ Found owned token with ID: ${tokenId}`);
									const nftItem = await processNFTToken(contract, contractAddress, tokenId.toString());
									if (nftItem) {
										nfts.push(nftItem);
										foundTokens++;
									}
								}
							} catch (error) {
								// Token doesn't exist or other error, continue
							}
						}
					}
					console.log(`    📊 Successfully processed ${foundTokens} NFTs from contract ${contractAddress}`);
				} else {
					console.log(`  ⚪ No NFTs found in contract ${contractAddress} via balanceOf()`);
				}
			} catch (error) {
				console.warn(`  ❌ Error checking NFT contract ${contractAddress}:`, error instanceof Error ? error.message : error);
			}
		}
		console.log(`🎯 Found ${nfts.length} total NFTs for address ${addr.address} on chain ${net.chainID}`);
		// Add debugging helper to window for testing
		if (typeof window !== 'undefined') {
			(window as any).addNFTContract = (contractAddress: string) => {
				console.log(`🔧 Testing contract manually: ${contractAddress}`);
				const contract = new Contract(contractAddress, erc721ABI, p);
				contract
					.balanceOf(addr.address)
					.then((balance: any) => {
						console.log(`Manual test result for ${contractAddress}:`, Number(balance));
					})
					.catch((error: any) => {
						console.error(`Manual test failed for ${contractAddress}:`, error);
					});
			};
			console.log('💡 TIP: Use window.addNFTContract("0x...") to test specific contracts manually');
		}
		return nfts;
	} catch (error) {
		console.error('Error loading NFTs:', error);
		return [];
	}
}
