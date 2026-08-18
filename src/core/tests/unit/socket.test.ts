import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IAccount } from '../../scripts/types.ts';

vi.mock('@/core/scripts/tauri.ts', (): { TAURI_SERVICE: boolean; invoke: undefined } => ({
	TAURI_SERVICE: false,
	invoke: undefined,
}));

import { failPendingRequests, handleSocketMessage, REQUEST_TIMEOUT_MS, sendAsync } from '../../scripts/socket.ts';

function makeAccount(socket?: WebSocket): IAccount {
	return {
		id: 'account',
		socket_id: 0,
		settings: {},
		credentials: { server: 'wss://example.test', address: 'user@example.test', password: 'password' },
		enabled: true,
		requests: {},
		module_data: {},
		available_modules: {},
		socket,
	};
}

describe('socket request lifecycle', (): void => {
	beforeEach((): void => {
		vi.stubGlobal('WebSocket', { OPEN: 1 });
	});

	afterEach((): void => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('settles immediately when the socket is not open', async (): Promise<void> => {
		const response = await sendAsync(makeAccount(), null, 'core', 'test');
		expect(response).toMatchObject({ error: true, message: 'WebSocket is not open' });
	});

	it('settles when a request times out', async (): Promise<void> => {
		vi.useFakeTimers();
		const socket = { readyState: 1, send: vi.fn(), bufferedAmount: 0 } as unknown as WebSocket;
		const account = makeAccount(socket);
		const responsePromise = sendAsync(account, null, 'core', 'test');
		await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
		await expect(responsePromise).resolves.toMatchObject({ error: true, message: 'Request timed out' });
		expect(account.requests).toEqual({});
	});

	it('settles pending requests when the connection closes', async (): Promise<void> => {
		const socket = { readyState: 1, send: vi.fn(), bufferedAmount: 0 } as unknown as WebSocket;
		const account = makeAccount(socket);
		const responsePromise = sendAsync(account, null, 'core', 'test');
		failPendingRequests(account, 'Connection closed');
		await expect(responsePromise).resolves.toMatchObject({ error: true, message: 'Connection closed' });
		expect(account.requests).toEqual({});
	});

	it('settles normally and clears the timeout when a response arrives', async (): Promise<void> => {
		vi.useFakeTimers();
		const socket = { readyState: 1, send: vi.fn(), bufferedAmount: 0 } as unknown as WebSocket;
		const account = makeAccount(socket);
		const responsePromise = sendAsync(account, null, 'core', 'test');
		const requestID = Number(Object.keys(account.requests)[0]);
		handleSocketMessage(account, { requestID, error: false, data: { ok: true } });
		await expect(responsePromise).resolves.toMatchObject({ error: false, data: { ok: true } });
		expect(account.requests).toEqual({});
		expect(vi.getTimerCount()).toBe(0);
	});
});
