/// <reference types="@vitest/browser/providers/playwright" />
/// <reference types="vitest/globals" />

declare const __BUILD_DATE__: string;
declare const __COMMIT_HASH__: string;
declare const __BRANCH__: string;

declare global {
	namespace globalThis {
		var vi: typeof import('vitest').vi | undefined;
	}
}
