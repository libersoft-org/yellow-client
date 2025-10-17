// Buffer polyfill for Ledger hardware wallet libraries
// This must be imported before any Ledger transport libraries

import { Buffer } from 'buffer';

// Make Buffer available globally for Ledger libraries
if (typeof globalThis !== 'undefined') {
	(globalThis as any).Buffer = Buffer;
}

if (typeof window !== 'undefined') {
	(window as any).Buffer = Buffer;
	(window as any).global = window;
}

export { Buffer };
