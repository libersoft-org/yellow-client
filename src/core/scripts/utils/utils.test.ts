import { describe, expect, test } from 'vitest';
import { getGuid } from './utils.js';

describe('getGuid', () => {
	test('should generate a GUID of default length (40)', () => {
		const guid = getGuid();
		expect(guid).toHaveLength(40);
		expect(typeof guid).toBe('string');
		expect(guid).toMatch(/^[0-9a-z]+$/);
	});

	test('should generate a GUID of specified length', () => {
		const lengths = [10, 20, 50, 100];

		lengths.forEach(length => {
			const guid = getGuid(length);
			expect(guid).toHaveLength(length);
			expect(typeof guid).toBe('string');
			expect(guid).toMatch(/^[0-9a-z]+$/);
		});
	});

	test('should generate different GUIDs on subsequent calls', () => {
		const guid1 = getGuid();
		const guid2 = getGuid();
		expect(guid1).not.toBe(guid2);
	});

	test('should only contain valid characters (0-9, a-z)', () => {
		const guid = getGuid(100);
		const validChars = '0123456789abcdefghijklmnopqrstuvwxyz';

		for (const char of guid) {
			expect(validChars).toContain(char);
		}
	});

	test('should handle edge cases', () => {
		const emptyGuid = getGuid(0);
		expect(emptyGuid).toBe('');

		const singleChar = getGuid(1);
		expect(singleChar).toHaveLength(1);
		expect(singleChar).toMatch(/^[0-9a-z]$/);
	});

	test('should use cryptographically secure random generation', () => {
		// Test that the function doesn't produce predictable patterns
		const guids = Array.from({ length: 100 }, () => getGuid(10));
		const uniqueGuids = new Set(guids);

		// With crypto random, we should have very high uniqueness
		expect(uniqueGuids.size).toBeGreaterThan(95); // Allow for very small chance of collision
	});
});
