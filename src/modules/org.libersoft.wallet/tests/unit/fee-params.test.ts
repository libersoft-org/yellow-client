import { describe, expect, it } from 'vitest';

/* Exercises the libersoft-crypto fee/nonce contract from the consumer side: crypto-utils has no test
 * runner of its own, and these are exactly the guarantees this client depends on. */
import { assertUsableFeeParams, feeParamsFromTotal, feeParamsMaxCost, isEip1559, withAddressLock, type ITransactionFeeParams } from 'libersoft-crypto/fee-params';

const eip1559: ITransactionFeeParams = {
	gasLimit: 21000n,
	maxFeePerGas: 100n,
	maxPriorityFeePerGas: 10n,
};

const legacy: ITransactionFeeParams = { gasLimit: 21000n, gasPrice: 100n };

describe('fee parameters', () => {
	it('prices the worst case the user can pay', () => {
		expect(feeParamsMaxCost(eip1559)).toBe(2_100_000n);
		expect(feeParamsMaxCost(legacy)).toBe(2_100_000n);
	});

	it('recognises the transaction type', () => {
		expect(isEip1559(eip1559)).toBe(true);
		expect(isEip1559(legacy)).toBe(false);
	});

	it('rejects parameters that cannot be signed', () => {
		expect(() => assertUsableFeeParams({ gasLimit: 0n, gasPrice: 1n })).toThrow(/gas limit/);
		expect(() => assertUsableFeeParams({ gasLimit: 21000n })).toThrow(/neither maxFeePerGas nor gasPrice/);
		expect(() =>
			assertUsableFeeParams({
				gasLimit: 21000n,
				maxFeePerGas: 10n,
				maxPriorityFeePerGas: 20n,
			})
		).toThrow(/maxPriorityFeePerGas exceeds/);
		expect(() => assertUsableFeeParams(eip1559)).not.toThrow();
	});

	it('turns a custom total into parameters that really cost that much', () => {
		/* This is the point of the whole type: a custom fee used to change a label only. */
		const custom = feeParamsFromTotal(eip1559, 4_200_000n);
		expect(feeParamsMaxCost(custom)).toBe(4_200_000n);
		expect(custom.maxFeePerGas).toBe(200n);
		/* The priority tip is kept below the cap. */
		expect(custom.maxPriorityFeePerGas).toBe(10n);
	});

	it('keeps legacy transactions legacy when deriving from a total', () => {
		const custom = feeParamsFromTotal(legacy, 4_200_000n);
		expect(custom.gasPrice).toBe(200n);
		expect(custom.maxFeePerGas).toBeUndefined();
	});

	it('refuses a total that cannot cover a single unit of gas', () => {
		expect(() => feeParamsFromTotal(eip1559, 1n)).toThrow(/too low/);
	});

	it('serialises transactions from the same address', async () => {
		const order: string[] = [];
		const first = withAddressLock(1, '0xabc', async () => {
			order.push('first:start');
			await new Promise(resolve => setTimeout(resolve, 10));
			order.push('first:end');
		});
		const second = withAddressLock(1, '0xABC', async () => {
			order.push('second:start');
			order.push('second:end');
		});
		await Promise.all([first, second]);
		/* The second send must not start before the first has finished - that overlap is how two
		 * transactions used to end up with the same nonce. */
		expect(order).toEqual(['first:start', 'first:end', 'second:start', 'second:end']);
	});

	it('keeps the queue alive after a failed transaction', async () => {
		await expect(
			withAddressLock(1, '0xdef', async () => {
				throw new Error('broadcast failed');
			})
		).rejects.toThrow('broadcast failed');
		await expect(withAddressLock(1, '0xdef', async () => 'ok')).resolves.toBe('ok');
	});
});
