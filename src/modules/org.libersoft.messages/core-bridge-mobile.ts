// Mobile/service bridge for core functionality
// In service context, send is injected globally
import type { Account, AccountStore } from '../../core/types.ts';

declare global {
	const send: (acc: Account, account: AccountStore | null, target: string, command: string, params: any, sendSessionID: boolean, callback: ((req: any, res: any) => void) | null, quiet: boolean) => any;
}

export { send };
export type { Account, AccountStore };
