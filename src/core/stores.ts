import { derived, writable } from 'svelte/store';
import { localStorageReadOnceSharedStore, localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import type { ModuleDeclaration } from './types.ts';

// Add global type declarations
declare global {
	const __BUILD_DATE__: string | undefined;
	const __COMMIT_HASH__: string | undefined;
	const __BRANCH__: string | undefined;
}

// Debug and UI stores
export const debug = writable(import.meta.env.VITE_CLIENT_DEBUG || false);
export const debugBuffer = writable('');
export const documentHeight = writable(0);
export const isMobile = writable(false);
export const mobileClass = derived(isMobile, $isMobile => ($isMobile ? 'mobile' : ''));
export const keyboardHeight = writable(0);
export const hideSidebarMobile = writable(false);
export const isClientFocused = writable(true);
export const mobileWidth = writable('768px');

// Core page and module selection
export const selected_corepage_id = writable<string | null>(null);
export const selected_module_id = writable<string | null>(null);

// Module configuration
export const modules_display_order = localStorageSharedStore<{ [key: string]: number }>('modules_display_order', {});
export const modules_disabled = localStorageSharedStore<string[]>('modules_disabled', []);
export const module_decls = writable<{ [key: string]: ModuleDeclaration }>({});

// Account selection
export const active_account_id = localStorageReadOnceSharedStore<string | null>('active_account_id', null);

// Helper function needed for build timestamp
import { friendlyTimestamp } from '@/core/utils/dateTime.ts';

// App metadata
export const product = 'Yellow';
export const motto = 'Experience the freedom of decentralized world';
export const version = '0.0.1';
export const build = typeof __BUILD_DATE__ !== 'undefined' ? friendlyTimestamp(__BUILD_DATE__) : 'unknown';
export const commit = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'unknown';
export const branch = typeof __BRANCH__ !== 'undefined' ? __BRANCH__ : 'unknown';
export const link = 'https://yellow.libersoft.org';
