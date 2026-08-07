/* Central redaction of secrets before anything leaves the app - console, native Tauri log, Sentry.
 * The rule is intentionally key-based rather than value-based: we cannot recognise a password by
 * looking at it, but we do know which property names hold one. */

export const REDACTED = '[redacted]';

/** Property names whose value must never be logged, matched case-insensitively. */
const SENSITIVE_KEYS: ReadonlySet<string> = new Set(['password', 'passwd', 'phrase', 'mnemonic', 'seed', 'privatekey', 'private_key', 'secret', 'sessionid', 'session_id', 'token', 'access_token', 'refresh_token', 'authorization', 'apikey', 'api_key']);

const MAX_DEPTH = 8;
const MAX_ARRAY_ITEMS = 200;
const MAX_STRING_LENGTH = 4096;

/* Key-based redaction only reaches structured data. Secrets also travel inside free text - error
 * messages quote the input that failed, HTTP plumbing formats headers into strings, and URLs carry
 * query parameters. These patterns cover the shapes that actually occur. */
const STRING_PATTERNS: ReadonlyArray<[RegExp, string]> = [
	/* Scheme-prefixed credentials first: the key=value rule below would otherwise stop at the space
	 * after "Bearer" and leave the token itself in place. */
	[/\b(bearer|basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, `$1 ${REDACTED}`],
	// key=value / key: value, in query strings, log lines and serialized headers
	[/\b(password|passwd|pass|phrase|mnemonic|seed|private_?key|secret|session_?id|token|access_token|refresh_token|api_?key|authorization)\b(\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&)}\]]+)/gi, `$1$2${REDACTED}`],
	// A bare BIP-39 mnemonic: twelve or more lowercase words in a row
	[/\b(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}\b/g, REDACTED],
	// Hex-encoded private keys / seeds
	[/\b0x[a-fA-F0-9]{64}\b/g, REDACTED],
];

/** Removes secrets that are embedded in free text rather than held in a named property. */
export function redactString(value: string): string {
	let out = value;
	for (const [pattern, replacement] of STRING_PATTERNS) out = out.replace(pattern, replacement);
	return out;
}

/** Strips the query string of a URL, keeping enough to identify the endpoint. */
function redactUrl(value: string): string {
	try {
		const url = new URL(value);
		if (!url.search && !url.username && !url.password) return value;
		url.search = url.search ? `?${REDACTED}` : '';
		url.username = '';
		url.password = '';
		return url.toString();
	} catch {
		return value;
	}
}

function looksLikeUrl(value: string): boolean {
	return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

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
		let str = value as string;
		if (looksLikeUrl(str)) str = redactUrl(str);
		str = redactString(str);
		return str.length > MAX_STRING_LENGTH ? str.slice(0, MAX_STRING_LENGTH) + '…[truncated]' : str;
	}
	if (type === 'bigint') return `${value}n`;
	if (type === 'function') return `[Function ${(value as Function).name || 'anonymous'}]`;
	if (type !== 'object') return value;

	const obj = value as object;
	/* Error objects used to be handed through untouched, which was the biggest hole in this module:
	 * a message routinely quotes the value that failed to parse or authenticate, and the stack can
	 * contain it too. The redacted copy keeps the shape so consumers can still read .message/.stack. */
	if (obj instanceof Error) return redactError(obj, depth, seen);
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

/** Rebuilds an Error with its message, stack and cause sanitized. */
function redactError(error: Error, depth: number, seen: WeakSet<object>): Error {
	const copy = new Error(redactString(error.message));
	copy.name = error.name;
	if (error.stack) copy.stack = redactString(error.stack);
	const cause = (error as Error & { cause?: unknown }).cause;
	if (cause !== undefined) (copy as Error & { cause?: unknown }).cause = redactValue(cause, depth + 1, seen);
	/* Own enumerable extras (response bodies, request details) go through the normal walk. */
	for (const key of Object.keys(error)) {
		if (key === 'message' || key === 'stack' || key === 'cause') continue;
		if (isSensitiveKey(key)) {
			(copy as any)[key] = REDACTED;
			continue;
		}
		try {
			(copy as any)[key] = redactValue((error as unknown as Record<string, unknown>)[key], depth + 1, seen);
		} catch {
			(copy as any)[key] = '[unreadable]';
		}
	}
	return copy;
}

/** Returns a copy of `value` with every secret-looking property replaced by a placeholder. */
export function redact<T>(value: T): T {
	return redactValue(value, 0, new WeakSet()) as T;
}

/** Convenience for log wrappers taking a variadic argument list. */
export function redactAll(args: unknown[]): unknown[] {
	return args.map(arg => redact(arg));
}
