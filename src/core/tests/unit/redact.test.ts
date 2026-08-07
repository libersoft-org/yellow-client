import { describe, expect, it } from 'vitest';
import { redact, redactAll, REDACTED } from '@/core/scripts/redact.ts';

describe('redact', (): void => {
	it('removes credentials from an account-shaped object', (): void => {
		const account = {
			id: 'acc-1',
			credentials: { server: 'wss://server.test', address: 'me@server.test', password: 'hunter2' },
			sessionID: 'session-abc',
		};
		const safe = redact(account);
		expect(safe.credentials.password).toBe(REDACTED);
		expect(safe.sessionID).toBe(REDACTED);
		// non-secret fields stay readable
		expect(safe.credentials.server).toBe('wss://server.test');
		expect(safe.id).toBe('acc-1');
	});

	it('removes wallet secrets regardless of key casing', (): void => {
		const wallet = { name: 'w', phrase: 'twelve words', privateKey: '0xdead', Mnemonic: 'x', nested: { seed: 's' } };
		const safe = redact(wallet) as any;
		expect(safe.phrase).toBe(REDACTED);
		expect(safe.privateKey).toBe(REDACTED);
		expect(safe.Mnemonic).toBe(REDACTED);
		expect(safe.nested.seed).toBe(REDACTED);
		expect(safe.name).toBe('w');
	});

	it('does not mutate the original object', (): void => {
		const original = { password: 'secret' };
		redact(original);
		expect(original.password).toBe('secret');
	});

	it('survives circular references', (): void => {
		const a: any = { password: 'p' };
		a.self = a;
		const safe = redact(a);
		expect(safe.password).toBe(REDACTED);
		expect(safe.self).toBe('[circular]');
	});

	it('redacts every argument of a log call', (): void => {
		const [first, second] = redactAll(['message', { token: 'abc' }]) as [string, any];
		expect(first).toBe('message');
		expect(second.token).toBe(REDACTED);
	});
});
