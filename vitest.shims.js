import { vi } from 'vitest';

// Polyfill WebSocket for ethers v6 compatibility in jsdom tests
import WebSocketImpl from 'ws';
globalThis.WebSocket = WebSocketImpl;

// Define build date and commit hash for tests
window.__BUILD_DATE__ = null;
window.__COMMIT_HASH__ = 'test-commit-hash';

// Mock global functions for tests
globalThis.send = vi.fn().mockImplementation(() => {
	// Return a mock response that doesn't cause errors
	return Promise.resolve();
});

globalThis.TAURI_SERVICE = false;
