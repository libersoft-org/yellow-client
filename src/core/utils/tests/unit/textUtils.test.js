import { describe, expect, test } from 'vitest';
import { truncateText, truncateTextEnd } from '@/core/utils/textUtils.js';

describe('truncateText', () => {
	test('should return the original text if it is shorter than maxLength', () => {
		expect(truncateText('Hello', 10)).toBe('Hello');
	});

	test('should truncate text with dots in the middle if it is longer than maxLength', () => {
		expect(truncateText('Hello World', 7)).toBe('He ..... ld');
	});

	test('should use default maxLength if not provided', () => {
		const longText = 'This is a very long text that should be truncated';
		expect(truncateText(longText)).not.toBe(longText);
	});
});

describe('truncateTextEnd', () => {
	test('should return the original text if it is shorter than maxLength', () => {
		expect(truncateTextEnd('Hello', 10)).toBe('Hello');
	});

	test('should truncate text with dots at the end if it is longer than maxLength', () => {
		expect(truncateTextEnd('Hello World', 8)).toBe('Hello...');
	});

	test('should use default maxLength if not provided', () => {
		const longText = 'This is a very long text that should be truncated';
		expect(truncateTextEnd(longText)).not.toBe(longText);
	});
});
