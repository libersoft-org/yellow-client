/* Central redaction of secrets before anything leaves the app - console, native Tauri log, Sentry.
 * The rule is intentionally key-based rather than value-based: we cannot recognise a password by
 * looking at it, but we do know which property names hold one. */

export const REDACTED = '[redacted]';

/** Property names whose value must never be logged, matched case-insensitively. */
const SENSITIVE_KEYS: ReadonlySet<string> = new Set(['password', 'passwd', 'phrase', 'mnemonic', 'seed', 'privatekey', 'private_key', 'secret', 'sessionid', 'session_id', 'token', 'access_token', 'refresh_token', 'authorization', 'apikey', 'api_key']);

const MAX_DEPTH = 8;
const MAX_ARRAY_ITEMS = 200;
const MAX_STRING_LENGTH = 4096;

function isSensitiveKey(key: string): boolean {
	return SENSITIVE_KEYS.has(key.toLowerCase().replace(/[-\s]/g, '_'));
}

/** Types that are either huge, circular by nature or meaningless once cloned. */
function describeOpaque(value: object): string | null {
	if (typeof Blob !== 'undefined' && value instanceof Blob) return `[Blob ${value.size} bytes]`;
	if (value instanceof ArrayBuffer) return `[ArrayBuffer ${value.byteLength} bytes]`;
	if (ArrayBuffer.isView(value)) return `[${value.constructor.name} ${value.byteLength} bytes]`;
	if (typeof WebSocket !== 'undefined' && value instanceof WebSocket) return '[WebSocket]';
	if (typeof Window !== 'undefined' && value instanceof Window) return '[Window]';
	if (typeof Node !== 'undefined' && value instanceof Node) return `[${value.constructor.name}]`;
	if (typeof Event !== 'undefined' && value instanceof Event) return `[${value.constructor.name} ${value.type}]`;
	return null;
}

function redactValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
	if (value === null || value === undefined) return value;
	const type = typeof value;
	if (type === 'string') {
		const str = value as string;
		return str.length > MAX_STRING_LENGTH ? str.slice(0, MAX_STRING_LENGTH) + '…[truncated]' : str;
	}
	if (type === 'bigint') return `${value}n`;
	if (type === 'function') return `[Function ${(value as Function).name || 'anonymous'}]`;
	if (type !== 'object') return value;

	const obj = value as object;
	if (obj instanceof Error) return obj;
	if (obj instanceof Date) return obj;
	if (obj instanceof RegExp) return obj;

	const opaque = describeOpaque(obj);
	if (opaque) return opaque;

	if (seen.has(obj)) return '[circular]';
	if (depth >= MAX_DEPTH) return '[max depth]';
	seen.add(obj);

	try {
		if (Array.isArray(obj)) {
			const items = obj.slice(0, MAX_ARRAY_ITEMS).map(item => redactValue(item, depth + 1, seen));
			if (obj.length > MAX_ARRAY_ITEMS) items.push(`…[${obj.length - MAX_ARRAY_ITEMS} more]`);
			return items;
		}
		if (obj instanceof Map) {
			const out: Record<string, unknown> = {};
			let i = 0;
			for (const [key, val] of obj) {
				if (i++ >= MAX_ARRAY_ITEMS) break;
				const keyStr = String(key);
				out[keyStr] = isSensitiveKey(keyStr) ? REDACTED : redactValue(val, depth + 1, seen);
			}
			return out;
		}
		if (obj instanceof Set) {
			return [...obj].slice(0, MAX_ARRAY_ITEMS).map(item => redactValue(item, depth + 1, seen));
		}
		const out: Record<string, unknown> = {};
		for (const key of Object.keys(obj)) {
			if (isSensitiveKey(key)) {
				out[key] = REDACTED;
				continue;
			}
			try {
				out[key] = redactValue((obj as Record<string, unknown>)[key], depth + 1, seen);
			} catch {
				out[key] = '[unreadable]';
			}
		}
		return out;
	} finally {
		seen.delete(obj);
	}
}

/** Returns a copy of `value` with every secret-looking property replaced by a placeholder. */
export function redact<T>(value: T): T {
	return redactValue(value, 0, new WeakSet()) as T;
}

/** Convenience for log wrappers taking a variadic argument list. */
export function redactAll(args: unknown[]): unknown[] {
	return args.map(arg => redact(arg));
}
