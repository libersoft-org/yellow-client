import { redact } from './redact.ts';

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
			/* Fail closed. Falling back to the raw arguments when redaction throws would defeat the
			 * point of the wrapper - and redact() walks objects with Object.keys(), which a hostile
			 * proxy can be made to throw. Each argument is redacted on its own so one unreadable value
			 * cannot suppress the rest of the line. */
			const safe = args.map(arg => {
				try {
					return redact(arg);
				} catch {
					return '[redaction failed]';
				}
			});
			try {
				original.apply(console, safe);
			} catch {
				original.call(console, '[log suppressed]');
			}
		};
	}
}
