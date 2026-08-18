import { describe, expect, it } from 'vitest';
import { parseTransferAmount, validateSufficientBalance } from '../../scripts/send-validation.ts';

describe('wallet send validation', (): void => {
	it('parses token amounts with token decimals', (): void => {
		expect(parseTransferAmount('1', 6)).toBe(1_000_000n);
	});

	it('rejects a token amount above the token balance', (): void => {
		expect(
			validateSufficientBalance({
				amount: 1_000_001n,
				fee: 1n,
				currentBalance: 1_000_000n,
				nativeBalance: 10n,
				isToken: true,
			})
		).toBe('Insufficient token balance');
	});

	it('rejects a token transfer without enough native balance for its fee', (): void => {
		expect(
			validateSufficientBalance({
				amount: 1_000_000n,
				fee: 11n,
				currentBalance: 1_000_000n,
				nativeBalance: 10n,
				isToken: true,
			})
		).toBe('Insufficient native currency balance for the transaction fee');
	});

	it('rejects a native transfer whose amount and fee exceed the balance', (): void => {
		expect(
			validateSufficientBalance({
				amount: 91n,
				fee: 10n,
				currentBalance: 100n,
				nativeBalance: 100n,
				isToken: false,
			})
		).toBe('Insufficient balance for the amount and transaction fee');
	});

	it('accepts a fully funded token transfer', (): void => {
		expect(
			validateSufficientBalance({
				amount: 1_000_000n,
				fee: 10n,
				currentBalance: 1_000_000n,
				nativeBalance: 10n,
				isToken: true,
			})
		).toBeNull();
	});
});
