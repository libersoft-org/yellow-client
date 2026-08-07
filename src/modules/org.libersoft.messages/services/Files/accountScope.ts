import { get } from 'svelte/store';
import { active_account } from '@/core/scripts/core.ts';
import type { IAccount } from '@/core/scripts/types.ts';

/* Upload IDs are only unique within one server. Everything that caches or tracks a transfer -
 * IndexedDB rows, the download/upload stores, in-flight request maps - must therefore be keyed by
 * the owning account as well, otherwise a colliding ID from another server can hand one account
 * another account's data. */

const SEPARATOR = '\u0000';

/** Stable identity of the account a transfer belongs to: server plus configured account id. */
export function accountScopeKey(acc: Pick<IAccount, 'id' | 'credentials'> | null | undefined): string | null {
	if (!acc?.id) return null;
	const server = acc.credentials?.server ?? '';
	return `${server}${SEPARATOR}${acc.id}`;
}

/** Scope key of the account currently in the foreground, or null when there is none. */
export function activeAccountScopeKey(): string | null {
	return accountScopeKey(get(active_account) as IAccount | null);
}

/** Composite identifier of a single transfer, safe to use as a map key. */
export function transferKey(scopeKey: string, uploadId: string): string {
	return `${scopeKey}${SEPARATOR}${uploadId}`;
}
