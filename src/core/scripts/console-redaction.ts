import { redactAll } from './redact.ts';

/* The central redactor only protects what goes through `log.*`. The codebase also has several
 * hundred direct `console.*` calls, and production builds keep `console.error` and `console.warn`
 * on purpose - they are what a user can be asked to read back. Those calls print whatever object
 * they are handed, which is how a secret reaches devtools, an exported log or a Sentry console
 * breadcrumb.
 *
 * Rather than rewriting every call site, the sinks themselves are wrapped. Install this *before*
 * Sentry.init(): Sentry instruments console at init, so wrapping first means breadcrumbs record the
 * redacted arguments. */

let installed = false;

/** Wraps console methods so their arguments are redacted before anything else sees them. */
export function installConsoleRedaction(methods: Array<'log' | 'info' | 'debug' | 'warn' | 'error' | 'trace'> = ['log', 'info', 'debug', 'warn', 'error', 'trace']): void {
	if (installed || typeof console === 'undefined') return;
	installed = true;
	for (const method of methods) {
		const original = console[method];
		if (typeof original !== 'function') continue;
		console[method] = (...args: unknown[]): void => {
			try {
				original.apply(console, redactAll(args));
			} catch {
				/* Redaction must never be the reason a diagnostic disappears. */
				original.apply(console, args);
			}
		};
	}
}
