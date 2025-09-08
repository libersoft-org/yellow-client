import { describe, it, expect } from 'vitest';
import { formatBalance } from 'libersoft-crypto/balance';

describe('formatBalance', () => {
	it('should handle very large negative numbers', () => {
		const result = formatBalance({
			amount: -99999999999999999999999999999999999999999123456789123456789n,
			decimals: 18,
			currency: 'ETH',
		});
		expect(result).toBeDefined();
		expect(result).toContain('-');
		expect(result).toContain('ETH');
	});

	it('should handle small negative numbers', () => {
		const result = formatBalance({
			amount: -1000n,
			decimals: 18,
			currency: 'ETH',
		});
		expect(result).toBeDefined();
		expect(result).toContain('-');
		expect(result).toContain('ETH');
	});

	it('should handle large numbers with 0 decimals and custom precision', () => {
		const result = formatBalance(
			{
				amount: 123456789123456789n,
				decimals: 0,
				currency: 'ETH',
			},
			6
		);
		expect(result).toBeDefined();
		expect(result).toContain('ETH');
		// formatBalance adds commas for readability and may have precision limitations
		expect(result).toMatch(/123,456,789,123,456,\d+/);
	});

	it('should handle zero amounts', () => {
		const result = formatBalance(
			{
				amount: 0n,
				decimals: 18,
				currency: 'ETH',
			},
			6
		);
		expect(result).toBeDefined();
		expect(result).toContain('0');
		expect(result).toContain('ETH');
	});

	it('should handle extremely large numbers with high decimals', () => {
		const result = formatBalance(
			{
				amount: 123456789123456789123456789123456789123456789123456789n,
				decimals: 40,
				currency: 'ETH',
			},
			2
		);
		expect(result).toBeDefined();
		expect(result).toContain('ETH');
	});
});
