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

	/* Key-based redaction alone never reached these - they were the audit's main objection. */
	it('removes secrets embedded in free text', (): void => {
		expect(redact('Login failed for password=hunter2')).toContain(REDACTED);
		expect(redact('Login failed for password=hunter2')).not.toContain('hunter2');
		expect(redact('Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc')).not.toContain('eyJhbGciOiJIUzI1NiJ9');
		expect(redact('sessionID: abc123def')).not.toContain('abc123def');
	});

	it('removes a bare mnemonic and hex private keys from text', (): void => {
		const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
		expect(redact(`recovering with ${mnemonic}`)).not.toContain('sausage');
		const key = '0x' + 'a'.repeat(64);
		expect(redact(`key ${key} used`)).not.toContain(key);
	});

	it('strips the query string of a URL', (): void => {
		const out = redact('https://server.test/login?password=hunter2&user=me');
		expect(out).not.toContain('hunter2');
		expect(out).toContain('server.test/login');
	});

	it('sanitizes Error message, stack and cause', (): void => {
		const cause = new Error('inner password=hunter2');
		const error = new Error('outer password=hunter2', { cause });
		(error as any).credentials = { password: 'hunter2', server: 'wss://x' };
		const safe = redact(error) as Error & { cause: Error; credentials: any };
		expect(safe).toBeInstanceOf(Error);
		expect(safe.message).not.toContain('hunter2');
		expect(safe.stack ?? '').not.toContain('hunter2');
		expect(safe.cause.message).not.toContain('hunter2');
		expect(safe.credentials.password).toBe(REDACTED);
		expect(safe.credentials.server).toBe('wss://x');
		// the original is untouched
		expect(error.message).toContain('hunter2');
	});

	it('redacts every argument of a log call', (): void => {
		const [first, second] = redactAll(['message', { token: 'abc' }]) as [string, any];
		expect(first).toBe('message');
		expect(second.token).toBe(REDACTED);
	});
});
