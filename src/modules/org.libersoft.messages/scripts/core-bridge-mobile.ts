// Mobile/service bridge for core functionality
// In service context, send is injected globally
import type { IAccount, AccountStore } from '@/core/scripts/types.ts';

declare global {
	const send: (acc: IAccount, account: AccountStore | null, target: string, command: string, params: any, sendSessionID: boolean, callback: ((req: any, res: any) => void) | null, quiet: boolean) => any;
}

export { send };
export type { IAccount as Account, AccountStore };
