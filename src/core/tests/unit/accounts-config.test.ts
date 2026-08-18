import { describe, expect, it } from 'vitest';
import { sanitizeAccountConfig, validateAccountConfig } from '@/core/scripts/accounts_config.ts';

function account(settings: unknown): any {
	return {
		id: 'acc-1',
		enabled: true,
		credentials: { server: 'wss://server.test', address: 'me@server.test', password: 'p' },
		settings,
	};
}

describe('account config validation', (): void => {
	/* Grouped settings are a supported shape and are covered by the import/export e2e suite - an
	 * earlier version of the prototype-pollution guard rejected them outright and broke import. */
	it('accepts nested settings objects', (): void => {
		const result = validateAccountConfig(
			account({
				'special-key': 'special-value',
				'unicode-тест': '测试',
				notifications: { enabled: true, sound: false },
				appearance: { theme: 'dark', fontSize: 14 },
			})
		);
		expect(result.errors).toEqual([]);
		expect(result.valid).toBe(true);
	});

	it('rejects prototype-polluting keys at the top level', (): void => {
		const result = validateAccountConfig(account(JSON.parse('{"__proto__": {"polluted": true}}')));
		expect(result.valid).toBe(false);
		expect(result.errors.join(' ')).toContain('__proto__');
	});

	it('rejects prototype-polluting keys nested anywhere', (): void => {
		const result = validateAccountConfig(account(JSON.parse('{"appearance": {"constructor": {"x": 1}}}')));
		expect(result.valid).toBe(false);
		expect(result.errors.join(' ')).toContain('appearance.constructor');
	});

	it('rejects settings nested absurdly deep', (): void => {
		let deep: any = 'x';
		for (let i = 0; i < 12; i++) deep = { next: deep };
		const result = validateAccountConfig(account(deep));
		expect(result.valid).toBe(false);
		expect(result.errors.join(' ')).toContain('nested too deeply');
	});

	it('keeps nested settings through sanitization', (): void => {
		const sanitized = sanitizeAccountConfig(
			account({
				notifications: { enabled: true, sound: false },
				tags: ['a', 'b'],
				'unicode-тест': '测试',
			})
		);
		expect(sanitized.settings['notifications']).toEqual({ enabled: true, sound: false });
		expect(sanitized.settings['tags']).toEqual(['a', 'b']);
		expect(sanitized.settings['unicode-тест']).toBe('测试');
	});

	it('strips polluting keys during sanitization and builds prototype-less objects', (): void => {
		const sanitized = sanitizeAccountConfig(account(JSON.parse('{"appearance": {"__proto__": {"polluted": true}, "theme": "dark"}}')));
		const appearance = sanitized.settings['appearance'] as Record<string, unknown>;
		expect(appearance['theme']).toBe('dark');
		expect(Object.keys(appearance)).toEqual(['theme']);
		expect(Object.getPrototypeOf(appearance)).toBeNull();
		expect(({} as any).polluted).toBeUndefined();
	});

	it('drops fields that are not part of the config shape', (): void => {
		const sanitized = sanitizeAccountConfig({ ...account({ theme: 'dark' }), somethingElse: 'nope' });
		expect((sanitized as any).somethingElse).toBeUndefined();
		expect(sanitized.credentials.address).toBe('me@server.test');
	});
});
